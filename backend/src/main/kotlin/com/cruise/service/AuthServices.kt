package com.cruise.service

import com.cruise.config.AuthProperties
import com.cruise.entity.*
import com.cruise.repository.*
import com.cruise.security.CustomUserDetailsService
import com.cruise.security.JwtTokenProvider
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import org.slf4j.LoggerFactory
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.time.LocalDateTime
import java.util.*

data class AuthProviderView(
    val providerKey: String,
    val providerType: String,
    val displayName: String,
    val loginUrl: String? = null,
    val configured: Boolean = true,
    val disabledReason: String? = null
)

data class AuthProvidersResponse(
    val providers: List<AuthProviderView>,
    val legacyPasswordEnabled: Boolean
)

data class AuthUserPayload(
    val id: Long,
    val username: String,
    val email: String,
    val role: String,
    val organizationId: Long?
)

data class AuthSessionResponse(
    val token: String,
    val userId: Long,
    val username: String,
    val email: String,
    val role: String,
    val organizationId: Long?,
    val providerKey: String? = null
)

data class MagicLinkSendRequest(
    val email: String,
    val organizationId: Long? = null
)

data class MagicLinkSendResponse(
    val sent: Boolean,
    val expiresInMinutes: Long
)

data class ExternalIdentityProfile(
    val subject: String,
    val email: String?,
    val emailVerified: Boolean,
    val displayName: String?,
    val avatarUrl: String?,
    val claimsJson: String?
)

@Service
class AuthProviderService(
    private val authProviderConfigRepository: AuthProviderConfigRepository,
    private val authProperties: AuthProperties
) {
    private fun isOidcConfigured(provider: AuthProviderConfig): Boolean =
        !provider.clientId.isNullOrBlank() &&
            !provider.authorizationUrl.isNullOrBlank() &&
            !provider.tokenUrl.isNullOrBlank() &&
            !provider.userinfoUrl.isNullOrBlank()

    fun getEnabledProviders(): AuthProvidersResponse {
        val providers = authProviderConfigRepository.findAllByEnabledTrueOrderByIsDefaultDescDisplayNameAsc()
            .map {
                val configured = when (it.providerType) {
                    "GOOGLE_OIDC", "ENTERPRISE_OIDC" -> isOidcConfigured(it)
                    else -> true
                }
                AuthProviderView(
                    providerKey = it.providerKey,
                    providerType = it.providerType,
                    displayName = it.displayName,
                    loginUrl = when (it.providerType) {
                        "GOOGLE_OIDC", "ENTERPRISE_OIDC" -> if (configured) "/api/auth/oauth/${it.providerKey}/start" else null
                        else -> null
                    },
                    configured = configured,
                    disabledReason = if (configured) null else "Provider configuration incomplete"
                )
            }

        return AuthProvidersResponse(
            providers = providers,
            legacyPasswordEnabled = authProperties.legacyPasswordEnabled
        )
    }

    fun getProvider(providerKey: String): AuthProviderConfig =
        authProviderConfigRepository.findByProviderKey(providerKey)
            ?.takeIf { it.enabled }
            ?: throw IllegalArgumentException("Unknown auth provider: $providerKey")
}

@Service
class AuthAuditService(
    private val authLoginEventRepository: AuthLoginEventRepository
) {
    fun record(providerKey: String?, email: String?, subject: String?, organizationId: Long?, success: Boolean, reason: String?) {
        authLoginEventRepository.save(
            AuthLoginEvent(
                providerKey = providerKey,
                email = email,
                subject = subject,
                organizationId = organizationId,
                success = success,
                reason = reason,
                createdAt = LocalDateTime.now()
            )
        )
    }
}

@Service
@Transactional
class IdentityProvisioningService(
    private val userRepository: UserRepository,
    private val userIdentityRepository: UserIdentityRepository,
    private val organizationRepository: OrganizationRepository,
    private val membershipRepository: MembershipRepository,
    private val teamRepository: TeamRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val customUserDetailsService: CustomUserDetailsService,
    private val authProperties: AuthProperties
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @Transactional
    fun resolveOrProvision(provider: AuthProviderConfig, profile: ExternalIdentityProfile): AuthSessionResponse {
        val existingIdentity = userIdentityRepository.findByProviderKeyAndSubject(provider.providerKey, profile.subject)
        if (existingIdentity != null) {
            val user = userRepository.findById(existingIdentity.userId).orElseThrow()
            existingIdentity.email = profile.email
            existingIdentity.emailVerified = profile.emailVerified
            existingIdentity.claimsJson = profile.claimsJson
            existingIdentity.lastLoginAt = LocalDateTime.now()
            existingIdentity.updatedAt = LocalDateTime.now()
            userIdentityRepository.save(existingIdentity)
            return issueSession(user, provider.providerKey)
        }

        if (!provider.autoProvisionUsers) {
            throw IllegalStateException("Account is not authorized for auto provisioning")
        }

        val email = profile.email ?: throw IllegalStateException("Email is required for provisioning")
        validateAllowedDomains(provider, email)

        val organization = provider.organizationId?.let { organizationRepository.findById(it).orElse(null) }
            ?: organizationRepository.findBySlug(authProperties.defaultOrganizationSlug)
            ?: organizationRepository.findAll().firstOrNull()

        val existingUser = userRepository.findByEmail(email)
        val user = existingUser ?: userRepository.save(
            User(
                username = buildUsername(email, profile.displayName),
                password = passwordEncoder.encode("oauth-${UUID.randomUUID()}"),
                email = email,
                displayName = profile.displayName,
                avatarUrl = profile.avatarUrl,
                role = "USER",
                status = "ACTIVE",
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            )
        )

        if (organization != null && membershipRepository.findByUserId(user.id).isEmpty()) {
            val team = teamRepository.findByOrganizationId(organization.id).firstOrNull()
            if (team != null) {
                membershipRepository.save(
                    Membership(
                        organizationId = organization.id,
                        teamId = team.id,
                        userId = user.id,
                        role = "MEMBER",
                        title = null,
                        joinedAt = LocalDateTime.now(),
                        active = true
                    )
                )
            }
        }

        userIdentityRepository.save(
            UserIdentity(
                userId = user.id,
                providerKey = provider.providerKey,
                providerType = provider.providerType,
                subject = profile.subject,
                email = email,
                emailVerified = profile.emailVerified,
                claimsJson = profile.claimsJson,
                lastLoginAt = LocalDateTime.now(),
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            )
        )

        logger.info("Provisioned user {} for provider {}", user.username, provider.providerKey)
        return issueSession(user, provider.providerKey)
    }

    fun issueSession(user: User, providerKey: String? = null, organizationIdOverride: Long? = null): AuthSessionResponse {
        val userDetails = customUserDetailsService.loadUserByUsername(user.username)
        val organizationId = organizationIdOverride ?: membershipRepository.findFirstByUserIdAndActiveTrue(user.id)?.organizationId
        val token = jwtTokenProvider.generateToken(userDetails, user.id, organizationId, user.role)
        return AuthSessionResponse(
            token = token,
            userId = user.id,
            username = user.username,
            email = user.email,
            role = user.role,
            organizationId = organizationId,
            providerKey = providerKey
        )
    }

    private fun validateAllowedDomains(provider: AuthProviderConfig, email: String) {
        val allowed = provider.allowedDomains
            ?.split(",")
            ?.map { it.trim().lowercase() }
            ?.filter { it.isNotBlank() }
            .orEmpty()
        if (allowed.isNotEmpty()) {
            val domain = email.substringAfter('@', "").lowercase()
            if (domain !in allowed) {
                throw IllegalStateException("Email domain is not allowed")
            }
        }
    }

    private fun buildUsername(email: String, displayName: String?): String {
        val preferred = displayName?.trim()?.replace("\\s+".toRegex(), ".")?.lowercase()
        val base = preferred?.takeIf { it.isNotBlank() } ?: email.substringBefore('@')
        return if (!userRepository.existsByUsername(base)) base else "${base}.${System.currentTimeMillis().toString().takeLast(4)}"
    }
}

@Service
@Transactional
class OidcAuthService(
    private val authProviderService: AuthProviderService,
    private val oauthLoginSessionRepository: OauthLoginSessionRepository,
    private val identityProvisioningService: IdentityProvisioningService,
    private val authAuditService: AuthAuditService,
    private val authProperties: AuthProperties,
    private val objectMapper: ObjectMapper
) {
    private val client = OkHttpClient()
    private val mapTypeReference = object : TypeReference<Map<String, Any?>>() {}

    fun createAuthorizationUrl(providerKey: String): String {
        val provider = authProviderService.getProvider(providerKey)
        require(provider.providerType == "GOOGLE_OIDC" || provider.providerType == "ENTERPRISE_OIDC") {
            "Provider does not support OIDC"
        }
        val state = UUID.randomUUID().toString()
        val nonce = UUID.randomUUID().toString()
        oauthLoginSessionRepository.save(
            OauthLoginSession(
                state = state,
                nonce = nonce,
                providerKey = providerKey,
                expiresAt = LocalDateTime.now().plusMinutes(10),
                createdAt = LocalDateTime.now()
            )
        )

        val params = linkedMapOf(
            "response_type" to "code",
            "client_id" to (provider.clientId ?: ""),
            "redirect_uri" to redirectUri(providerKey),
            "scope" to (provider.scopes ?: "openid profile email"),
            "state" to state,
            "nonce" to nonce
        )
        val query = params.entries.joinToString("&") { "${urlEncode(it.key)}=${urlEncode(it.value)}" }
        return "${provider.authorizationUrl}?$query"
    }

    @Transactional
    fun handleCallback(providerKey: String, code: String, state: String): String {
        val provider = authProviderService.getProvider(providerKey)
        val session = oauthLoginSessionRepository.findByState(state)
            ?: throw IllegalStateException("Invalid login state")
        if (session.consumedAt != null || session.expiresAt.isBefore(LocalDateTime.now()) || session.providerKey != providerKey) {
            throw IllegalStateException("Expired login state")
        }

        val tokenResponse = exchangeToken(provider, code)
        validateNonce(session.nonce, tokenResponse["id_token"] as? String)
        val accessToken = tokenResponse["access_token"]?.toString()
            ?: throw IllegalStateException("Missing access token")
        val profile = fetchUserProfile(provider, accessToken)
        val authSession = try {
            identityProvisioningService.resolveOrProvision(provider, profile)
        } catch (ex: Exception) {
            authAuditService.record(provider.providerKey, profile.email, profile.subject, provider.organizationId, false, ex.message)
            throw ex
        }

        session.consumedAt = LocalDateTime.now()
        oauthLoginSessionRepository.save(session)
        authAuditService.record(provider.providerKey, profile.email, profile.subject, authSession.organizationId, true, null)
        return buildFrontendCallbackUrl(authSession)
    }

    private fun exchangeToken(provider: AuthProviderConfig, code: String): Map<String, Any?> {
        val formBody = FormBody.Builder()
            .add("grant_type", "authorization_code")
            .add("code", code)
            .add("redirect_uri", redirectUri(provider.providerKey))
            .add("client_id", provider.clientId ?: "")
            .add("client_secret", provider.clientSecret ?: "")
            .build()

        val request = Request.Builder()
            .url(provider.tokenUrl ?: throw IllegalStateException("Missing token URL"))
            .post(formBody)
            .build()

        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException("OIDC token exchange failed: ${response.code}")
            }
            return objectMapper.readValue(body, mapTypeReference)
        }
    }

    private fun fetchUserProfile(provider: AuthProviderConfig, accessToken: String): ExternalIdentityProfile {
        val request = Request.Builder()
            .url(provider.userinfoUrl ?: throw IllegalStateException("Missing userinfo URL"))
            .get()
            .header("Authorization", "Bearer $accessToken")
            .build()

        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException("OIDC userinfo request failed: ${response.code}")
            }
            val claims = objectMapper.readValue(body, mapTypeReference)
            return ExternalIdentityProfile(
                subject = claims["sub"]?.toString() ?: throw IllegalStateException("Missing subject"),
                email = claims["email"]?.toString(),
                emailVerified = claims["email_verified"]?.toString()?.toBooleanStrictOrNull() ?: false,
                displayName = claims["name"]?.toString(),
                avatarUrl = claims["picture"]?.toString(),
                claimsJson = objectMapper.writeValueAsString(claims)
            )
        }
    }

    private fun validateNonce(expectedNonce: String, idToken: String?) {
        if (idToken.isNullOrBlank()) return
        val parts = idToken.split(".")
        if (parts.size < 2) return
        val payloadJson = String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8)
        val payload = objectMapper.readValue(payloadJson, mapTypeReference)
        val actualNonce = payload["nonce"]?.toString()
        if (!actualNonce.isNullOrBlank() && actualNonce != expectedNonce) {
            throw IllegalStateException("Invalid nonce")
        }
    }

    private fun buildFrontendCallbackUrl(authSession: AuthSessionResponse): String {
        val params = linkedMapOf(
            "token" to authSession.token,
            "userId" to authSession.userId.toString(),
            "username" to authSession.username,
            "email" to authSession.email,
            "role" to authSession.role,
            "organizationId" to (authSession.organizationId?.toString() ?: "")
        )
        val query = params.entries.joinToString("&") { "${urlEncode(it.key)}=${urlEncode(it.value)}" }
        return "${authProperties.frontendBaseUrl.trimEnd('/')}${authProperties.magicLink.callbackPath}?$query"
    }

    private fun redirectUri(providerKey: String): String =
        "${authProperties.backendBaseUrl.trimEnd('/')}/api/auth/oauth/$providerKey/callback"

    private fun urlEncode(value: String): String = URLEncoder.encode(value, StandardCharsets.UTF_8)
}

@Service
@Transactional
class MagicLinkAuthService(
    private val authProviderService: AuthProviderService,
    private val magicLinkTokenRepository: MagicLinkTokenRepository,
    private val identityProvisioningService: IdentityProvisioningService,
    private val authAuditService: AuthAuditService,
    private val userRepository: UserRepository,
    private val membershipRepository: MembershipRepository,
    private val javaMailSender: org.springframework.beans.factory.ObjectProvider<JavaMailSender>,
    private val authProperties: AuthProperties
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun sendMagicLink(request: MagicLinkSendRequest): MagicLinkSendResponse {
        val provider = authProviderService.getProvider(authProperties.email.providerKey)
        val rawToken = UUID.randomUUID().toString() + UUID.randomUUID().toString().replace("-", "")
        val hash = sha256(rawToken)
        val tokenEntity = MagicLinkToken(
            email = request.email.trim().lowercase(),
            tokenHash = hash,
            organizationId = request.organizationId,
            expiresAt = LocalDateTime.now().plusMinutes(authProperties.magicLink.tokenTtlMinutes),
            createdAt = LocalDateTime.now()
        )
        magicLinkTokenRepository.save(tokenEntity)

        val verifyUrl = "${authProperties.backendBaseUrl.trimEnd('/')}/api/auth/magic-link/verify?token=${urlEncode(rawToken)}"
        sendEmail(request.email, verifyUrl)
        logger.info("Magic link generated for {} -> {}", request.email, verifyUrl)
        authAuditService.record(provider.providerKey, request.email, null, request.organizationId, true, "magic_link_sent")
        return MagicLinkSendResponse(sent = true, expiresInMinutes = authProperties.magicLink.tokenTtlMinutes)
    }

    @Transactional
    fun verify(token: String): String {
        val provider = authProviderService.getProvider(authProperties.email.providerKey)
        val record = magicLinkTokenRepository.findByTokenHash(sha256(token))
            ?: throw IllegalStateException("Invalid login link")
        if (record.usedAt != null || record.expiresAt.isBefore(LocalDateTime.now())) {
            throw IllegalStateException("Login link has expired")
        }

        val email = record.email
        validateAllowedDomains(provider, email)
        val profile = ExternalIdentityProfile(
            subject = email,
            email = email,
            emailVerified = true,
            displayName = email.substringBefore('@'),
            avatarUrl = null,
            claimsJson = null
        )
        val authSession = try {
            identityProvisioningService.resolveOrProvision(provider, profile)
        } catch (ex: Exception) {
            authAuditService.record(provider.providerKey, email, email, record.organizationId, false, ex.message)
            throw ex
        }

        record.usedAt = LocalDateTime.now()
        magicLinkTokenRepository.save(record)
        authAuditService.record(provider.providerKey, email, email, authSession.organizationId, true, null)
        return "${authProperties.frontendBaseUrl.trimEnd('/')}${authProperties.magicLink.callbackPath}?token=${urlEncode(authSession.token)}&userId=${authSession.userId}&username=${urlEncode(authSession.username)}&email=${urlEncode(authSession.email)}&role=${urlEncode(authSession.role)}&organizationId=${authSession.organizationId ?: ""}"
    }

    fun getCurrentUser(username: String): AuthUserPayload {
        val user = userRepository.findByUsername(username) ?: throw IllegalStateException("User not found")
        val organizationId = membershipRepository.findFirstByUserIdAndActiveTrue(user.id)?.organizationId
        return AuthUserPayload(
            id = user.id,
            username = user.username,
            email = user.email,
            role = user.role,
            organizationId = organizationId
        )
    }

    private fun validateAllowedDomains(provider: AuthProviderConfig, email: String) {
        val allowed = provider.allowedDomains
            ?.split(",")
            ?.map { it.trim().lowercase() }
            ?.filter { it.isNotBlank() }
            .orEmpty()
        if (allowed.isNotEmpty()) {
            val domain = email.substringAfter('@', "").lowercase()
            if (domain !in allowed) {
                throw IllegalStateException("Email domain is not allowed")
            }
        }
    }

    private fun sendEmail(email: String, verifyUrl: String) {
        val sender = javaMailSender.ifAvailable
        if (sender == null) {
            logger.info("Mail sender not configured; magic link for {} is {}", email, verifyUrl)
            return
        }
        val message = SimpleMailMessage()
        message.setTo(email)
        message.subject = "Cruise sign-in link"
        message.text = "Use this link to sign in to Cruise:\n\n$verifyUrl\n\nThis link expires in ${authProperties.magicLink.tokenTtlMinutes} minutes."
        message.from = authProperties.magicLink.fromAddress
        sender.send(message)
    }

    private fun sha256(value: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(value.toByteArray(StandardCharsets.UTF_8)).joinToString("") { "%02x".format(it) }
    }

    private fun urlEncode(value: String): String = URLEncoder.encode(value, StandardCharsets.UTF_8)
}
