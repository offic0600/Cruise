package com.cruise.service

import com.cruise.config.AuthProperties
import com.cruise.entity.*
import com.cruise.repository.*
import com.cruise.security.CustomUserDetailsService
import com.cruise.security.JwtTokenProvider
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.nimbusds.jose.crypto.ECDSAVerifier
import com.nimbusds.jose.crypto.MACVerifier
import com.nimbusds.jose.crypto.RSASSAVerifier
import com.nimbusds.jose.jwk.ECKey
import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.OctetSequenceKey
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jwt.SignedJWT
import okhttp3.Credentials
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import org.slf4j.LoggerFactory
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.authentication.AnonymousAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.security.SecureRandom
import java.time.Instant
import java.time.LocalDateTime
import java.util.*
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import kotlin.io.encoding.ExperimentalEncodingApi
import org.springframework.http.HttpStatus

data class AuthProviderView(
    val providerKey: String,
    val providerType: String,
    val protocol: String,
    val displayName: String,
    val loginUrl: String? = null,
    val configured: Boolean = true,
    val disabledReason: String? = null,
    val scopeLevel: String,
    val organizationId: Long? = null,
    val buttonText: String? = null,
    val buttonLogoUrl: String? = null,
    val priority: Int = 0,
    val ssoEnforced: Boolean = false,
    val supportsPasswordFallback: Boolean = true
)

data class AuthProvidersResponse(
    val providers: List<AuthProviderView>,
    val legacyPasswordEnabled: Boolean
)

data class ProviderDiscoveryRequest(
    val email: String,
    val organizationId: Long? = null
)

data class ProviderDiscoveryResponse(
    val matched: AuthProviderView? = null,
    val ssoEnforced: Boolean = false,
    val supportsPasswordFallback: Boolean = true,
    val supportsMagicLinkFallback: Boolean = true
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
    val issuer: String?,
    val email: String?,
    val emailVerified: Boolean,
    val displayName: String?,
    val preferredUsername: String?,
    val avatarUrl: String?,
    val normalizedClaimsJson: String?,
    val rawIdTokenClaimsJson: String?,
    val rawUserinfoClaimsJson: String?
)

data class ClaimMappingConfig(
    val subjectClaim: String = "sub",
    val emailClaim: String = "email",
    val emailVerifiedClaim: String = "email_verified",
    val displayNameClaim: String = "name",
    val usernameClaim: String = "preferred_username",
    val avatarClaim: String = "picture"
)

data class OidcDiscoveryMetadata(
    val issuer: String?,
    val authorizationEndpoint: String?,
    val tokenEndpoint: String?,
    val userinfoEndpoint: String?,
    val jwksUri: String?,
    val endSessionEndpoint: String?
)

data class CreateAuthProviderRequest(
    val providerKey: String,
    val displayName: String,
    val scopeLevel: String = "GLOBAL",
    val organizationId: Long? = null,
    val slug: String? = null,
    val issuerUrl: String? = null,
    val discoveryUrl: String? = null,
    val authorizationUrl: String? = null,
    val tokenUrl: String? = null,
    val userinfoUrl: String? = null,
    val jwksUrl: String? = null,
    val endSessionUrl: String? = null,
    val clientId: String? = null,
    val clientSecret: String? = null,
    val clientAuthMethod: String = "client_secret_post",
    val scopes: String = "openid profile email",
    val usePkce: Boolean = true,
    val pkceMethod: String = "S256",
    val prompt: String? = null,
    val loginHintTemplate: String? = null,
    val domainMatchMode: String = "NONE",
    val allowedEmailDomains: List<String> = emptyList(),
    val enforceSso: Boolean = false,
    val autoProvisionUsers: Boolean = true,
    val accountLinkPolicy: String = "EMAIL_AUTO_LINK",
    val profileSyncMode: String = "FIRST_LOGIN",
    val claimMapping: ClaimMappingConfig? = null,
    val buttonText: String? = null,
    val buttonLogoUrl: String? = null,
    val displayOrder: Int = 0,
    val enabled: Boolean = true,
    val isDefault: Boolean = false
)

data class UpdateAuthProviderRequest(
    val displayName: String? = null,
    val scopeLevel: String? = null,
    val organizationId: Long? = null,
    val slug: String? = null,
    val issuerUrl: String? = null,
    val discoveryUrl: String? = null,
    val authorizationUrl: String? = null,
    val tokenUrl: String? = null,
    val userinfoUrl: String? = null,
    val jwksUrl: String? = null,
    val endSessionUrl: String? = null,
    val clientId: String? = null,
    val clientSecret: String? = null,
    val clientSecretChanged: Boolean = false,
    val clientAuthMethod: String? = null,
    val scopes: String? = null,
    val usePkce: Boolean? = null,
    val pkceMethod: String? = null,
    val prompt: String? = null,
    val loginHintTemplate: String? = null,
    val domainMatchMode: String? = null,
    val allowedEmailDomains: List<String>? = null,
    val enforceSso: Boolean? = null,
    val autoProvisionUsers: Boolean? = null,
    val accountLinkPolicy: String? = null,
    val profileSyncMode: String? = null,
    val claimMapping: ClaimMappingConfig? = null,
    val buttonText: String? = null,
    val buttonLogoUrl: String? = null,
    val displayOrder: Int? = null,
    val enabled: Boolean? = null,
    val isDefault: Boolean? = null
)

data class TestAuthProviderRequest(
    val issuerUrl: String? = null,
    val discoveryUrl: String? = null,
    val authorizationUrl: String? = null,
    val tokenUrl: String? = null,
    val userinfoUrl: String? = null,
    val jwksUrl: String? = null,
    val endSessionUrl: String? = null,
    val clientId: String? = null,
    val clientSecret: String? = null
)

data class TestAuthProviderResponse(
    val success: Boolean,
    val message: String,
    val metadata: OidcDiscoveryMetadata? = null
)

data class AuthProviderAdminDto(
    val id: Long,
    val providerKey: String,
    val displayName: String,
    val protocol: String,
    val providerType: String,
    val slug: String?,
    val scopeLevel: String,
    val organizationId: Long?,
    val issuerUrl: String?,
    val discoveryUrl: String?,
    val authorizationUrl: String?,
    val tokenUrl: String?,
    val userinfoUrl: String?,
    val jwksUrl: String?,
    val endSessionUrl: String?,
    val clientId: String?,
    val clientSecretMasked: String?,
    val clientAuthMethod: String,
    val scopes: String?,
    val usePkce: Boolean,
    val pkceMethod: String,
    val prompt: String?,
    val loginHintTemplate: String?,
    val domainMatchMode: String,
    val allowedEmailDomains: List<String>,
    val enforceSso: Boolean,
    val autoProvisionUsers: Boolean,
    val accountLinkPolicy: String,
    val profileSyncMode: String,
    val claimMapping: ClaimMappingConfig,
    val buttonText: String?,
    val buttonLogoUrl: String?,
    val displayOrder: Int,
    val enabled: Boolean,
    val isDefault: Boolean,
    val lastTestedAt: String?,
    val lastTestResult: String?
)

data class LogoutResponse(
    val status: String,
    val logoutRedirectUrl: String? = null
)

@Service
class ProviderSecretCipher(private val authProperties: AuthProperties) {
    private val keySpec by lazy {
        val digest = MessageDigest.getInstance("SHA-256")
        val key = digest.digest(authProperties.providerSecretKey.toByteArray(StandardCharsets.UTF_8))
        SecretKeySpec(key, "AES")
    }

    @OptIn(ExperimentalEncodingApi::class)
    fun encrypt(raw: String?): String? {
        if (raw.isNullOrBlank()) return null
        if (raw.startsWith("enc:")) return raw
        val iv = ByteArray(12)
        SecureRandom().nextBytes(iv)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, GCMParameterSpec(128, iv))
        val encrypted = cipher.doFinal(raw.toByteArray(StandardCharsets.UTF_8))
        return "enc:${kotlin.io.encoding.Base64.encode(iv + encrypted)}"
    }

    @OptIn(ExperimentalEncodingApi::class)
    fun decrypt(value: String?): String? {
        if (value.isNullOrBlank()) return null
        if (!value.startsWith("enc:")) return value
        val bytes = kotlin.io.encoding.Base64.decode(value.removePrefix("enc:"))
        val iv = bytes.copyOfRange(0, 12)
        val payload = bytes.copyOfRange(12, bytes.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, keySpec, GCMParameterSpec(128, iv))
        return String(cipher.doFinal(payload), StandardCharsets.UTF_8)
    }

    fun mask(value: String?): String? {
        val plain = decrypt(value) ?: return null
        return if (plain.length <= 8) "********" else "${plain.take(4)}****${plain.takeLast(2)}"
    }
}

@Service
class AuthenticatedUserResolver(
    private val userRepository: UserRepository,
    private val membershipRepository: MembershipRepository
) {
    fun currentUsername(): String =
        SecurityContextHolder.getContext().authentication?.name
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated user")

    fun currentUser(): User =
        userRepository.findByUsername(currentUsername())
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")

    fun requirePlatformAdmin(): User {
        val user = currentUser()
        if (user.role != "ADMIN") {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Platform admin required")
        }
        return user
    }

    fun requireOrganizationAdmin(organizationId: Long): User {
        val user = currentUser()
        if (user.role == "ADMIN") return user
        val membership = membershipRepository.findFirstByUserIdAndOrganizationIdAndActiveTrue(user.id, organizationId)
            ?: throw ResponseStatusException(HttpStatus.FORBIDDEN, "Organization access denied")
        if (membership.role !in setOf("OWNER", "ADMIN")) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Organization admin required")
        }
        return user
    }
}

@Service
class OidcMetadataService(
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    private val client = OkHttpClient()
    private val mapTypeReference = object : TypeReference<Map<String, Any?>>() {}

    fun discover(issuerUrl: String?, discoveryUrl: String?): OidcDiscoveryMetadata {
        val resolvedDiscoveryUrl = when {
            !discoveryUrl.isNullOrBlank() -> discoveryUrl
            !issuerUrl.isNullOrBlank() -> "${issuerUrl.trimEnd('/')}/.well-known/openid-configuration"
            else -> throw IllegalStateException("issuerUrl or discoveryUrl is required")
        }
        val request = Request.Builder().url(resolvedDiscoveryUrl).get().build()
        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException("OIDC discovery failed: ${response.code}")
            }
            val payload = objectMapper.readValue(body, mapTypeReference)
            return OidcDiscoveryMetadata(
                issuer = payload["issuer"]?.toString(),
                authorizationEndpoint = payload["authorization_endpoint"]?.toString(),
                tokenEndpoint = payload["token_endpoint"]?.toString(),
                userinfoEndpoint = payload["userinfo_endpoint"]?.toString(),
                jwksUri = payload["jwks_uri"]?.toString(),
                endSessionEndpoint = payload["end_session_endpoint"]?.toString()
                    ?: payload["endsession_endpoint"]?.toString()
            )
        }
    }

    fun merge(provider: AuthProviderConfig): OidcDiscoveryMetadata {
        val discovered = if (!provider.issuerUrl.isNullOrBlank() || !provider.discoveryUrl.isNullOrBlank()) {
            runCatching { discover(provider.issuerUrl, provider.discoveryUrl) }
                .onFailure { logger.warn("OIDC discovery failed for {}: {}", provider.providerKey, it.message) }
                .getOrNull()
        } else {
            null
        }
        return OidcDiscoveryMetadata(
            issuer = provider.issuerUrl ?: discovered?.issuer,
            authorizationEndpoint = provider.authorizationUrl ?: discovered?.authorizationEndpoint,
            tokenEndpoint = provider.tokenUrl ?: discovered?.tokenEndpoint,
            userinfoEndpoint = provider.userinfoUrl ?: discovered?.userinfoEndpoint,
            jwksUri = provider.jwksUrl ?: discovered?.jwksUri,
            endSessionEndpoint = provider.endSessionUrl ?: discovered?.endSessionEndpoint
        )
    }
}

@Service
class OidcJwtVerifier(
    private val oidcMetadataService: OidcMetadataService,
    private val objectMapper: ObjectMapper
) {
    private val client = OkHttpClient()
    private val jwkCache = mutableMapOf<String, JWKSet>()
    private val mapTypeReference = object : TypeReference<Map<String, Any?>>() {}

    fun validate(provider: AuthProviderConfig, idToken: String, expectedNonce: String): Map<String, Any?> {
        val metadata = oidcMetadataService.merge(provider)
        val jwt = SignedJWT.parse(idToken)
        val header = jwt.header
        val claims = jwt.jwtClaimsSet
        val issuer = claims.issuer
        val expectedIssuer = metadata.issuer
        if (!expectedIssuer.isNullOrBlank() && issuer != expectedIssuer) {
            throw IllegalStateException("Invalid token issuer")
        }
        if (provider.clientId.isNullOrBlank() || claims.audience.none { it == provider.clientId }) {
            throw IllegalStateException("Invalid token audience")
        }
        val expiration = claims.expirationTime?.toInstant()
        if (expiration == null || expiration.isBefore(Instant.now())) {
            throw IllegalStateException("ID token expired")
        }
        val issuedAt = claims.issueTime?.toInstant()
        if (issuedAt != null && issuedAt.isAfter(Instant.now().plusSeconds(60))) {
            throw IllegalStateException("ID token issue time is invalid")
        }
        if (claims.getStringClaim("nonce") != null && claims.getStringClaim("nonce") != expectedNonce) {
            throw IllegalStateException("Invalid nonce")
        }

        val jwksUri = metadata.jwksUri ?: throw IllegalStateException("Missing jwks endpoint")
        val jwkSet = jwkCache.getOrPut(jwksUri) { loadJwkSet(jwksUri) }
        val kid = header.keyID
        val jwk = jwkSet.keys.firstOrNull { it.keyID == kid } ?: jwkSet.keys.firstOrNull()
            ?: throw IllegalStateException("Signing key not found")

        val verified = when (jwk) {
            is RSAKey -> jwt.verify(RSASSAVerifier(jwk.toRSAPublicKey()))
            is ECKey -> jwt.verify(ECDSAVerifier(jwk.toECPublicKey()))
            is OctetSequenceKey -> jwt.verify(MACVerifier(jwk.toByteArray()))
            else -> false
        }
        if (!verified) {
            throw IllegalStateException("Invalid token signature")
        }

        return objectMapper.readValue(
            objectMapper.writeValueAsString(claims.toJSONObject()),
            mapTypeReference
        )
    }

    private fun loadJwkSet(jwksUri: String): JWKSet {
        val request = Request.Builder().url(jwksUri).get().build()
        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException("JWK load failed: ${response.code}")
            }
            return JWKSet.parse(body)
        }
    }
}

@Service
class AuthProviderService(
    private val authProviderConfigRepository: AuthProviderConfigRepository,
    private val authProviderDomainRepository: AuthProviderDomainRepository,
    private val membershipRepository: MembershipRepository,
    private val userRepository: UserRepository,
    private val authProperties: AuthProperties
) {
    fun getEnabledProviders(organizationId: Long? = null): AuthProvidersResponse {
        val providers = visibleProviders(resolveRequestedOrganizationId(organizationId))
            .map { toView(it) }
        return AuthProvidersResponse(
            providers = providers,
            legacyPasswordEnabled = authProperties.legacyPasswordEnabled
        )
    }

    fun discoverProvider(email: String, organizationId: Long? = null): ProviderDiscoveryResponse {
        val matched = resolveProviderByEmail(email, resolveRequestedOrganizationId(organizationId))
        val provider = matched?.let(::toView)
        return ProviderDiscoveryResponse(
            matched = provider,
            ssoEnforced = matched?.enforceSso ?: false,
            supportsPasswordFallback = matched?.enforceSso != true && authProperties.legacyPasswordEnabled,
            supportsMagicLinkFallback = matched?.enforceSso != true && authProperties.magicLink.enabled
        )
    }

    fun getProvider(providerKey: String): AuthProviderConfig =
        authProviderConfigRepository.findByProviderKey(providerKey)
            ?.takeIf { it.enabled }
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown auth provider: $providerKey")

    fun visibleProviders(organizationId: Long? = null): List<AuthProviderConfig> {
        val all = authProviderConfigRepository.findAllByEnabledTrueOrderByDisplayOrderAscIsDefaultDescDisplayNameAsc()
        return all.filter { provider ->
            provider.scopeLevel == "GLOBAL" || (organizationId != null && provider.organizationId == organizationId)
        }
    }

    fun resolveProviderByEmail(email: String, organizationId: Long? = null): AuthProviderConfig? {
        val domain = email.substringAfter('@', "").trim().lowercase()
        if (domain.isBlank()) return null
        val domainHit = authProviderDomainRepository.findByEmailDomain(domain)
            ?.let { authProviderConfigRepository.findById(it.providerId).orElse(null) }
            ?.takeIf { it.enabled }
        if (domainHit != null) return domainHit

        val visible = visibleProviders(organizationId)
        val organizationDomainHit = visible.firstOrNull { provider ->
            provider.scopeLevel == "ORGANIZATION" && provider.allowedEmailDomains()
                .any { it == domain }
        }
        if (organizationDomainHit != null) return organizationDomainHit

        val organizationDefault = visible.firstOrNull {
            it.scopeLevel == "ORGANIZATION" && it.organizationId == organizationId && it.isDefault
        }
        if (organizationDefault != null) return organizationDefault

        return visible.firstOrNull { it.scopeLevel == "GLOBAL" && it.isDefault }
            ?: visible.firstOrNull { it.scopeLevel == "GLOBAL" }
    }

    private fun toView(provider: AuthProviderConfig): AuthProviderView {
        val configured = when (provider.protocol) {
            "OIDC" -> !provider.clientId.isNullOrBlank() && (!provider.authorizationUrl.isNullOrBlank() || !provider.issuerUrl.isNullOrBlank())
            else -> true
        }
        return AuthProviderView(
            providerKey = provider.providerKey,
            providerType = provider.providerType,
            protocol = provider.protocol,
            displayName = provider.displayName,
            loginUrl = if (provider.protocol == "OIDC" && configured) "/api/auth/oauth/${provider.providerKey}/start" else null,
            configured = configured,
            disabledReason = if (configured) null else "Provider configuration incomplete",
            scopeLevel = provider.scopeLevel,
            organizationId = provider.organizationId,
            buttonText = provider.buttonText,
            buttonLogoUrl = provider.buttonLogoUrl,
            priority = provider.displayOrder,
            ssoEnforced = provider.enforceSso,
            supportsPasswordFallback = !provider.enforceSso && authProperties.legacyPasswordEnabled
        )
    }

    private fun resolveRequestedOrganizationId(requestedOrganizationId: Long?): Long? {
        if (requestedOrganizationId == null) return null
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication == null || authentication is AnonymousAuthenticationToken || authentication.name == "anonymousUser") {
            return null
        }
        val user = userRepository.findByUsername(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")
        if (user.role == "ADMIN") return requestedOrganizationId
        val membership = membershipRepository.findFirstByUserIdAndOrganizationIdAndActiveTrue(user.id, requestedOrganizationId)
            ?: throw ResponseStatusException(HttpStatus.FORBIDDEN, "Organization access denied")
        return membership.organizationId
    }
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

    fun resolveOrProvision(provider: AuthProviderConfig, profile: ExternalIdentityProfile, preferredOrganizationId: Long? = null): AuthSessionResponse {
        val existingIdentity = userIdentityRepository.findByProviderKeyAndSubject(provider.providerKey, profile.subject)
        if (existingIdentity != null) {
            val user = userRepository.findById(existingIdentity.userId).orElseThrow()
            updateIdentity(existingIdentity, provider, profile)
            val resolvedOrganizationId = resolveTargetOrganizationId(user, provider.organizationId, preferredOrganizationId)
            ensureMembership(user, resolvedOrganizationId)
            return issueSession(user, provider.providerKey, resolvedOrganizationId)
        }

        val email = profile.email?.trim()?.lowercase()
            ?: throw IllegalStateException("Email is required for provisioning")
        validateAllowedDomains(provider, email)

        val existingUser = if (provider.accountLinkPolicy == "EMAIL_AUTO_LINK") {
            if (!profile.emailVerified) {
                throw IllegalStateException("Verified email is required for automatic account linking")
            }
            userRepository.findByEmail(email)
        } else null
        val user = existingUser ?: run {
            if (!provider.autoProvisionUsers) {
                throw IllegalStateException("Account is not authorized for auto provisioning")
            }
            userRepository.save(
                User(
                    username = buildUsername(email, profile.preferredUsername, profile.displayName),
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
        }

        val resolvedOrganizationId = resolveTargetOrganizationId(user, provider.organizationId, preferredOrganizationId)
        ensureMembership(user, resolvedOrganizationId)
        userIdentityRepository.save(
            UserIdentity(
                userId = user.id,
                providerKey = provider.providerKey,
                providerType = provider.providerType,
                subject = profile.subject,
                issuer = profile.issuer,
                email = email,
                emailVerified = profile.emailVerified,
                preferredUsername = profile.preferredUsername,
                name = profile.displayName,
                avatarUrl = profile.avatarUrl,
                claimsJson = profile.normalizedClaimsJson,
                rawIdTokenClaimsJson = profile.rawIdTokenClaimsJson,
                rawUserinfoClaimsJson = profile.rawUserinfoClaimsJson,
                lastLoginAt = LocalDateTime.now(),
                linkedAt = LocalDateTime.now(),
                syncAt = LocalDateTime.now(),
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            )
        )

        logger.info("Provisioned user {} for provider {}", user.username, provider.providerKey)
        return issueSession(user, provider.providerKey, resolvedOrganizationId)
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

    private fun ensureMembership(user: User, organizationId: Long?) {
        val targetOrganization = organizationId?.let { organizationRepository.findById(it).orElse(null) }
            ?: membershipRepository.findFirstByUserIdAndActiveTrue(user.id)?.organizationId?.let { organizationRepository.findById(it).orElse(null) }
            ?: organizationRepository.findBySlug(authProperties.defaultOrganizationSlug)
            ?: organizationRepository.findAll().firstOrNull()
            ?: return
        if (membershipRepository.findFirstByUserIdAndOrganizationIdAndActiveTrue(user.id, targetOrganization.id) != null) {
            return
        }
        val team = teamRepository.findByOrganizationId(targetOrganization.id).firstOrNull() ?: return
        membershipRepository.save(
            Membership(
                organizationId = targetOrganization.id,
                teamId = team.id,
                userId = user.id,
                role = "MEMBER",
                title = null,
                joinedAt = LocalDateTime.now(),
                active = true
            )
        )
    }

    private fun validateAllowedDomains(provider: AuthProviderConfig, email: String) {
        val allowed = provider.allowedEmailDomains()
        if (allowed.isNotEmpty()) {
            val domain = email.substringAfter('@', "").lowercase()
            if (domain !in allowed) {
                throw IllegalStateException("Email domain is not allowed")
            }
        }
    }

    private fun updateIdentity(identity: UserIdentity, provider: AuthProviderConfig, profile: ExternalIdentityProfile) {
        identity.providerType = provider.providerType
        identity.email = profile.email
        identity.emailVerified = profile.emailVerified
        identity.issuer = profile.issuer
        identity.preferredUsername = profile.preferredUsername
        identity.name = profile.displayName
        identity.avatarUrl = profile.avatarUrl
        identity.claimsJson = profile.normalizedClaimsJson
        identity.rawIdTokenClaimsJson = profile.rawIdTokenClaimsJson
        identity.rawUserinfoClaimsJson = profile.rawUserinfoClaimsJson
        identity.lastLoginAt = LocalDateTime.now()
        identity.syncAt = LocalDateTime.now()
        identity.updatedAt = LocalDateTime.now()
        userIdentityRepository.save(identity)
    }

    private fun resolveTargetOrganizationId(user: User, providerOrganizationId: Long?, preferredOrganizationId: Long?): Long? {
        if (preferredOrganizationId != null) {
            return preferredOrganizationId
        }
        if (providerOrganizationId != null) {
            return providerOrganizationId
        }
        return membershipRepository.findFirstByUserIdAndActiveTrue(user.id)?.organizationId
            ?: organizationRepository.findBySlug(authProperties.defaultOrganizationSlug)?.id
            ?: organizationRepository.findAll().firstOrNull()?.id
    }

    private fun buildUsername(email: String, preferredUsername: String?, displayName: String?): String {
        val candidates = listOf(preferredUsername, displayName?.replace("\\s+".toRegex(), ".")?.lowercase(), email.substringBefore('@'))
            .mapNotNull { it?.trim()?.takeIf(String::isNotBlank) }
        val base = candidates.firstOrNull() ?: "user"
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
    private val oidcMetadataService: OidcMetadataService,
    private val oidcJwtVerifier: OidcJwtVerifier,
    private val objectMapper: ObjectMapper,
    private val providerSecretCipher: ProviderSecretCipher,
    private val authProperties: AuthProperties
) {
    private val client = OkHttpClient()
    private val mapTypeReference = object : TypeReference<Map<String, Any?>>() {}

    fun createAuthorizationUrl(providerKey: String, loginHint: String? = null, organizationId: Long? = null, redirect: String? = null): String {
        val provider = authProviderService.getProvider(providerKey)
        require(provider.protocol == "OIDC") { "Provider does not support OIDC" }
        val metadata = oidcMetadataService.merge(provider)
        val state = UUID.randomUUID().toString()
        val nonce = UUID.randomUUID().toString()
        val codeVerifier = generateCodeVerifier()
        val redirectUri = redirectUri(providerKey)
        val organizationHint = if (provider.scopeLevel == "ORGANIZATION") {
            provider.organizationId
        } else {
            null
        }
        oauthLoginSessionRepository.save(
            OauthLoginSession(
                state = state,
                nonce = nonce,
                providerKey = providerKey,
                codeVerifier = codeVerifier,
                redirectUri = redirectUri,
                organizationHint = organizationHint,
                loginHint = loginHint,
                requestedScopes = provider.scopes ?: "openid profile email",
                postLoginRedirect = redirect,
                expiresAt = LocalDateTime.now().plusMinutes(10),
                createdAt = LocalDateTime.now()
            )
        )

        val params = linkedMapOf(
            "response_type" to "code",
            "client_id" to (provider.clientId ?: ""),
            "redirect_uri" to redirectUri,
            "scope" to (provider.scopes ?: "openid profile email"),
            "state" to state,
            "nonce" to nonce
        )
        if (provider.usePkce) {
            params["code_challenge"] = generateCodeChallenge(codeVerifier)
            params["code_challenge_method"] = provider.pkceMethod.ifBlank { "S256" }
        }
        if (!provider.prompt.isNullOrBlank()) params["prompt"] = provider.prompt!!
        if (!loginHint.isNullOrBlank()) params["login_hint"] = loginHint
        val query = params.entries.joinToString("&") { "${urlEncode(it.key)}=${urlEncode(it.value)}" }
        return "${metadata.authorizationEndpoint ?: throw IllegalStateException("Missing authorization endpoint")}?$query"
    }

    fun handleCallback(providerKey: String, code: String, state: String): String {
        val provider = authProviderService.getProvider(providerKey)
        val session = oauthLoginSessionRepository.findByState(state)
            ?: throw IllegalStateException("Invalid login state")
        if (session.consumedAt != null || session.expiresAt.isBefore(LocalDateTime.now()) || session.providerKey != providerKey) {
            throw IllegalStateException("Expired login state")
        }

        val tokenResponse = exchangeToken(provider, code, session)
        val idToken = tokenResponse["id_token"]?.toString() ?: throw IllegalStateException("Missing id_token")
        val idTokenClaims = oidcJwtVerifier.validate(provider, idToken, session.nonce)
        val accessToken = tokenResponse["access_token"]?.toString()
            ?: throw IllegalStateException("Missing access token")
        val profile = fetchUserProfile(provider, accessToken, idTokenClaims)
        val authSession = try {
            identityProvisioningService.resolveOrProvision(provider, profile, session.organizationHint)
        } catch (ex: Exception) {
            authAuditService.record(provider.providerKey, profile.email, profile.subject, provider.organizationId, false, ex.message)
            throw ex
        }

        session.consumedAt = LocalDateTime.now()
        oauthLoginSessionRepository.save(session)
        authAuditService.record(provider.providerKey, profile.email, profile.subject, authSession.organizationId, true, null)
        return buildFrontendCallbackUrl(authSession, session.postLoginRedirect)
    }

    fun buildLogoutResponse(providerKey: String?, idTokenHint: String?, postLogoutRedirectUri: String?): LogoutResponse {
        if (providerKey.isNullOrBlank()) return LogoutResponse(status = "logged_out")
        val provider = authProviderService.getProvider(providerKey)
        val metadata = oidcMetadataService.merge(provider)
        val endSessionEndpoint = metadata.endSessionEndpoint ?: return LogoutResponse(status = "logged_out")
        val params = linkedMapOf<String, String>()
        if (!idTokenHint.isNullOrBlank()) params["id_token_hint"] = idTokenHint
        if (!postLogoutRedirectUri.isNullOrBlank()) params["post_logout_redirect_uri"] = postLogoutRedirectUri
        val redirectUrl = if (params.isEmpty()) {
            endSessionEndpoint
        } else {
            "$endSessionEndpoint?${params.entries.joinToString("&") { "${urlEncode(it.key)}=${urlEncode(it.value)}" }}"
        }
        return LogoutResponse(status = "logged_out", logoutRedirectUrl = redirectUrl)
    }

    private fun exchangeToken(provider: AuthProviderConfig, code: String, session: OauthLoginSession): Map<String, Any?> {
        val metadata = oidcMetadataService.merge(provider)
        val builder = FormBody.Builder()
            .add("grant_type", "authorization_code")
            .add("code", code)
            .add("redirect_uri", session.redirectUri ?: redirectUri(provider.providerKey))
            .add("client_id", provider.clientId ?: "")
        if (provider.usePkce && !session.codeVerifier.isNullOrBlank()) {
            builder.add("code_verifier", session.codeVerifier!!)
        }
        if (provider.clientAuthMethod == "client_secret_post") {
            builder.add("client_secret", providerSecretCipher.decrypt(provider.clientSecret) ?: "")
        }
        val requestBuilder = Request.Builder()
            .url(metadata.tokenEndpoint ?: throw IllegalStateException("Missing token endpoint"))
            .post(builder.build())
        if (provider.clientAuthMethod == "client_secret_basic") {
            requestBuilder.header(
                "Authorization",
                Credentials.basic(provider.clientId ?: "", providerSecretCipher.decrypt(provider.clientSecret) ?: "")
            )
        }

        client.newCall(requestBuilder.build()).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException("OIDC token exchange failed: ${response.code}")
            }
            return objectMapper.readValue(body, mapTypeReference)
        }
    }

    private fun fetchUserProfile(provider: AuthProviderConfig, accessToken: String, idTokenClaims: Map<String, Any?>): ExternalIdentityProfile {
        val metadata = oidcMetadataService.merge(provider)
        val userinfoClaims = metadata.userinfoEndpoint?.let { endpoint ->
            val request = Request.Builder()
                .url(endpoint)
                .get()
                .header("Authorization", "Bearer $accessToken")
                .build()
            client.newCall(request).execute().use { response ->
                val body = response.body?.string().orEmpty()
                if (!response.isSuccessful) {
                    throw IllegalStateException("OIDC userinfo request failed: ${response.code}")
                }
                objectMapper.readValue(body, mapTypeReference)
            }
        } ?: emptyMap()

        val claims = LinkedHashMap<String, Any?>()
        claims.putAll(idTokenClaims)
        claims.putAll(userinfoClaims)
        val mapping = provider.claimMapping()
        return ExternalIdentityProfile(
            subject = claimAsString(claims, mapping.subjectClaim) ?: throw IllegalStateException("Missing subject"),
            issuer = claimAsString(claims, "iss"),
            email = claimAsString(claims, mapping.emailClaim)?.trim()?.lowercase(),
            emailVerified = claimAsBoolean(claims, mapping.emailVerifiedClaim),
            displayName = claimAsString(claims, mapping.displayNameClaim),
            preferredUsername = claimAsString(claims, mapping.usernameClaim),
            avatarUrl = claimAsString(claims, mapping.avatarClaim),
            normalizedClaimsJson = objectMapper.writeValueAsString(claims),
            rawIdTokenClaimsJson = objectMapper.writeValueAsString(idTokenClaims),
            rawUserinfoClaimsJson = objectMapper.writeValueAsString(userinfoClaims)
        )
    }

    private fun buildFrontendCallbackUrl(authSession: AuthSessionResponse, postLoginRedirect: String?): String {
        val params = linkedMapOf(
            "token" to authSession.token,
            "userId" to authSession.userId.toString(),
            "username" to authSession.username,
            "email" to authSession.email,
            "role" to authSession.role,
            "organizationId" to (authSession.organizationId?.toString() ?: "")
        )
        if (!postLoginRedirect.isNullOrBlank()) {
            params["redirect"] = postLoginRedirect
        }
        val query = params.entries.joinToString("&") { "${urlEncode(it.key)}=${urlEncode(it.value)}" }
        return "${authProperties.frontendBaseUrl.trimEnd('/')}${authProperties.magicLink.callbackPath}?$query"
    }

    private fun redirectUri(providerKey: String): String =
        "${authProperties.backendBaseUrl.trimEnd('/')}/api/auth/oauth/$providerKey/callback"

    private fun claimAsString(claims: Map<String, Any?>, key: String): String? = claims[key]?.toString()

    private fun claimAsBoolean(claims: Map<String, Any?>, key: String): Boolean =
        when (val value = claims[key]) {
            is Boolean -> value
            is String -> value.toBooleanStrictOrNull() ?: false
            else -> false
        }

    private fun generateCodeVerifier(): String {
        val bytes = ByteArray(64)
        SecureRandom().nextBytes(bytes)
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    private fun generateCodeChallenge(codeVerifier: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(digest.digest(codeVerifier.toByteArray(StandardCharsets.UTF_8)))
    }

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

    fun verify(token: String): String {
        val provider = authProviderService.getProvider(authProperties.email.providerKey)
        val record = magicLinkTokenRepository.findByTokenHash(sha256(token))
            ?: throw IllegalStateException("Invalid login link")
        if (record.usedAt != null || record.expiresAt.isBefore(LocalDateTime.now())) {
            throw IllegalStateException("Login link has expired")
        }

        val email = record.email
        if (provider.allowedEmailDomains().isNotEmpty()) {
            val domain = email.substringAfter('@', "").lowercase()
            if (domain !in provider.allowedEmailDomains()) {
                throw IllegalStateException("Email domain is not allowed")
            }
        }
        val profile = ExternalIdentityProfile(
            subject = email,
            issuer = null,
            email = email,
            emailVerified = true,
            displayName = email.substringBefore('@'),
            preferredUsername = email.substringBefore('@'),
            avatarUrl = null,
            normalizedClaimsJson = null,
            rawIdTokenClaimsJson = null,
            rawUserinfoClaimsJson = null
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

@Service
@Transactional
class AuthProviderAdminService(
    private val authProviderConfigRepository: AuthProviderConfigRepository,
    private val authProviderDomainRepository: AuthProviderDomainRepository,
    private val authProviderService: AuthProviderService,
    private val oidcMetadataService: OidcMetadataService,
    private val authenticatedUserResolver: AuthenticatedUserResolver,
    private val providerSecretCipher: ProviderSecretCipher,
    private val objectMapper: ObjectMapper,
    private val userIdentityRepository: UserIdentityRepository
) {
    fun list(scopeLevel: String?, organizationId: Long?): List<AuthProviderAdminDto> {
        val currentUser = authenticatedUserResolver.currentUser()
        val providers = authProviderConfigRepository.findAll().sortedWith(compareBy<AuthProviderConfig> { it.displayOrder }.thenBy { it.displayName })
        return providers.filter { provider ->
            when (provider.scopeLevel) {
                "GLOBAL" -> currentUser.role == "ADMIN"
                "ORGANIZATION" -> provider.organizationId != null && hasOrganizationAccess(provider.organizationId)
                else -> false
            }
        }.filter { scopeLevel == null || it.scopeLevel == scopeLevel }
            .filter { organizationId == null || it.organizationId == organizationId }
            .map(::toAdminDto)
    }

    fun get(id: Long): AuthProviderAdminDto = toAdminDto(loadManagedProvider(id))

    fun create(request: CreateAuthProviderRequest): AuthProviderAdminDto {
        validateScopeAccess(request.scopeLevel, request.organizationId)
        val currentUser = authenticatedUserResolver.currentUser()
        val provider = AuthProviderConfig(
            providerKey = request.providerKey.trim(),
            providerType = "OIDC",
            protocol = "OIDC",
            displayName = request.displayName.trim(),
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
            createdBy = currentUser.username,
            updatedBy = currentUser.username
        )
        applyRequest(provider, request)
        validateProvider(provider, null)
        val saved = authProviderConfigRepository.save(provider)
        syncDomains(saved, request.allowedEmailDomains)
        return toAdminDto(saved)
    }

    fun update(id: Long, request: UpdateAuthProviderRequest): AuthProviderAdminDto {
        val provider = loadManagedProvider(id)
        val currentUser = authenticatedUserResolver.currentUser()
        applyRequest(provider, request)
        provider.updatedAt = LocalDateTime.now()
        provider.updatedBy = currentUser.username
        validateProvider(provider, id)
        val saved = authProviderConfigRepository.save(provider)
        request.allowedEmailDomains?.let { syncDomains(saved, it) }
        return toAdminDto(saved)
    }

    fun setEnabled(id: Long, enabled: Boolean): AuthProviderAdminDto {
        val provider = loadManagedProvider(id)
        provider.enabled = enabled
        provider.updatedAt = LocalDateTime.now()
        return toAdminDto(authProviderConfigRepository.save(provider))
    }

    fun setDefault(id: Long): AuthProviderAdminDto {
        val provider = loadManagedProvider(id)
        clearDefault(provider.scopeLevel, provider.organizationId)
        provider.isDefault = true
        provider.updatedAt = LocalDateTime.now()
        return toAdminDto(authProviderConfigRepository.save(provider))
    }

    fun testConnection(id: Long?, request: TestAuthProviderRequest): TestAuthProviderResponse {
        val source = if (id != null) {
            val provider = loadManagedProvider(id)
            provider.copyForTest(providerSecretCipher, request)
        } else {
            AuthProviderConfig(
                providerKey = "test",
                providerType = "OIDC",
                protocol = "OIDC",
                displayName = "test",
                issuerUrl = request.issuerUrl,
                discoveryUrl = request.discoveryUrl,
                authorizationUrl = request.authorizationUrl,
                tokenUrl = request.tokenUrl,
                userinfoUrl = request.userinfoUrl,
                jwksUrl = request.jwksUrl,
                endSessionUrl = request.endSessionUrl,
                clientId = request.clientId,
                clientSecret = providerSecretCipher.encrypt(request.clientSecret)
            )
        }
        val metadata = oidcMetadataService.merge(source)
        if (metadata.authorizationEndpoint.isNullOrBlank() || metadata.tokenEndpoint.isNullOrBlank() || metadata.userinfoEndpoint.isNullOrBlank() || metadata.jwksUri.isNullOrBlank()) {
            return TestAuthProviderResponse(false, "Discovery metadata incomplete", metadata)
        }
        if (id != null) {
            val provider = loadManagedProvider(id)
            provider.lastTestedAt = LocalDateTime.now()
            provider.lastTestResult = "success"
            authProviderConfigRepository.save(provider)
        }
        return TestAuthProviderResponse(true, "OIDC provider metadata resolved", metadata)
    }

    fun delete(id: Long) {
        val provider = loadManagedProvider(id)
        if (userIdentityRepository.existsByProviderKey(provider.providerKey)) {
            provider.enabled = false
            provider.updatedAt = LocalDateTime.now()
            authProviderConfigRepository.save(provider)
            return
        }
        authProviderDomainRepository.deleteAllByProviderId(provider.id)
        authProviderConfigRepository.delete(provider)
    }

    private fun validateScopeAccess(scopeLevel: String, organizationId: Long?) {
        when (scopeLevel) {
            "GLOBAL" -> authenticatedUserResolver.requirePlatformAdmin()
            "ORGANIZATION" -> {
                val targetOrganizationId = organizationId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "organizationId is required")
                authenticatedUserResolver.requireOrganizationAdmin(targetOrganizationId)
            }
            else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported scope level")
        }
    }

    private fun hasOrganizationAccess(organizationId: Long?): Boolean {
        if (organizationId == null) return false
        return authenticatedUserResolver.runCatchingMembership(organizationId)
    }

    private fun applyRequest(provider: AuthProviderConfig, request: CreateAuthProviderRequest) {
        provider.scopeLevel = request.scopeLevel
        provider.organizationId = request.organizationId
        provider.slug = request.slug
        provider.issuerUrl = request.issuerUrl
        provider.discoveryUrl = request.discoveryUrl
        provider.authorizationUrl = request.authorizationUrl
        provider.tokenUrl = request.tokenUrl
        provider.userinfoUrl = request.userinfoUrl
        provider.jwksUrl = request.jwksUrl
        provider.endSessionUrl = request.endSessionUrl
        provider.clientId = request.clientId
        provider.clientSecret = providerSecretCipher.encrypt(request.clientSecret)
        provider.clientAuthMethod = request.clientAuthMethod
        provider.scopes = request.scopes
        provider.usePkce = request.usePkce
        provider.pkceMethod = request.pkceMethod
        provider.prompt = request.prompt
        provider.loginHintTemplate = request.loginHintTemplate
        provider.domainMatchMode = request.domainMatchMode
        provider.allowedEmailDomains = request.allowedEmailDomains.normalizedDomains()
        provider.enforceSso = request.enforceSso
        provider.autoProvisionUsers = request.autoProvisionUsers
        provider.accountLinkPolicy = request.accountLinkPolicy
        provider.profileSyncMode = request.profileSyncMode
        provider.claimMappingJson = objectMapper.writeValueAsString(request.claimMapping ?: ClaimMappingConfig())
        provider.buttonText = request.buttonText
        provider.buttonLogoUrl = request.buttonLogoUrl
        provider.displayOrder = request.displayOrder
        provider.enabled = request.enabled
        provider.isDefault = request.isDefault
    }

    private fun applyRequest(provider: AuthProviderConfig, request: UpdateAuthProviderRequest) {
        request.displayName?.let { provider.displayName = it.trim() }
        request.scopeLevel?.let { provider.scopeLevel = it }
        request.organizationId?.let { provider.organizationId = it }
        if (request.scopeLevel == "GLOBAL") provider.organizationId = null
        if (request.slug != null) provider.slug = request.slug
        if (request.issuerUrl != null) provider.issuerUrl = request.issuerUrl
        if (request.discoveryUrl != null) provider.discoveryUrl = request.discoveryUrl
        if (request.authorizationUrl != null) provider.authorizationUrl = request.authorizationUrl
        if (request.tokenUrl != null) provider.tokenUrl = request.tokenUrl
        if (request.userinfoUrl != null) provider.userinfoUrl = request.userinfoUrl
        if (request.jwksUrl != null) provider.jwksUrl = request.jwksUrl
        if (request.endSessionUrl != null) provider.endSessionUrl = request.endSessionUrl
        if (request.clientId != null) provider.clientId = request.clientId
        if (request.clientSecretChanged) provider.clientSecret = providerSecretCipher.encrypt(request.clientSecret)
        if (request.clientAuthMethod != null) provider.clientAuthMethod = request.clientAuthMethod
        if (request.scopes != null) provider.scopes = request.scopes
        if (request.usePkce != null) provider.usePkce = request.usePkce
        if (request.pkceMethod != null) provider.pkceMethod = request.pkceMethod
        if (request.prompt != null) provider.prompt = request.prompt
        if (request.loginHintTemplate != null) provider.loginHintTemplate = request.loginHintTemplate
        if (request.domainMatchMode != null) provider.domainMatchMode = request.domainMatchMode
        if (request.allowedEmailDomains != null) provider.allowedEmailDomains = request.allowedEmailDomains.normalizedDomains()
        if (request.enforceSso != null) provider.enforceSso = request.enforceSso
        if (request.autoProvisionUsers != null) provider.autoProvisionUsers = request.autoProvisionUsers
        if (request.accountLinkPolicy != null) provider.accountLinkPolicy = request.accountLinkPolicy
        if (request.profileSyncMode != null) provider.profileSyncMode = request.profileSyncMode
        if (request.claimMapping != null) provider.claimMappingJson = objectMapper.writeValueAsString(request.claimMapping)
        if (request.buttonText != null) provider.buttonText = request.buttonText
        if (request.buttonLogoUrl != null) provider.buttonLogoUrl = request.buttonLogoUrl
        if (request.displayOrder != null) provider.displayOrder = request.displayOrder
        if (request.enabled != null) provider.enabled = request.enabled
        if (request.isDefault != null) provider.isDefault = request.isDefault
    }

    private fun validateProvider(provider: AuthProviderConfig, currentId: Long?) {
        if (provider.providerKey.isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "providerKey is required")
        }
        val duplicate = authProviderConfigRepository.findByProviderKey(provider.providerKey)
        if (duplicate != null && duplicate.id != currentId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "providerKey already exists")
        }
        validateScopeAccess(provider.scopeLevel, provider.organizationId)
        provider.allowedEmailDomains().forEach { domain ->
            if (currentId != null && authProviderDomainRepository.existsByEmailDomainAndProviderIdNot(domain, currentId)) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "email domain already bound: $domain")
            }
            if (currentId == null && authProviderDomainRepository.findByEmailDomain(domain) != null) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "email domain already bound: $domain")
            }
        }
        if (provider.isDefault) {
            clearDefault(provider.scopeLevel, provider.organizationId, currentId)
        }
    }

    private fun syncDomains(provider: AuthProviderConfig, requestedDomains: List<String>) {
        authProviderDomainRepository.deleteAllByProviderId(provider.id)
        requestedDomains.normalizedDomainList().forEach { domain ->
            authProviderDomainRepository.save(AuthProviderDomain(providerId = provider.id, emailDomain = domain))
        }
        provider.allowedEmailDomains = requestedDomains.normalizedDomains()
        authProviderConfigRepository.save(provider)
    }

    private fun clearDefault(scopeLevel: String, organizationId: Long?, excludeId: Long? = null) {
        authProviderConfigRepository.findAll().filter { current ->
            current.scopeLevel == scopeLevel &&
                current.organizationId == organizationId &&
                current.isDefault &&
                (excludeId == null || current.id != excludeId)
        }.forEach {
            it.isDefault = false
            authProviderConfigRepository.save(it)
        }
    }

    private fun loadManagedProvider(id: Long): AuthProviderConfig {
        val provider = authProviderConfigRepository.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found") }
        validateScopeAccess(provider.scopeLevel, provider.organizationId)
        return provider
    }

    private fun toAdminDto(provider: AuthProviderConfig): AuthProviderAdminDto =
        AuthProviderAdminDto(
            id = provider.id,
            providerKey = provider.providerKey,
            displayName = provider.displayName,
            protocol = provider.protocol,
            providerType = provider.providerType,
            slug = provider.slug,
            scopeLevel = provider.scopeLevel,
            organizationId = provider.organizationId,
            issuerUrl = provider.issuerUrl,
            discoveryUrl = provider.discoveryUrl,
            authorizationUrl = provider.authorizationUrl,
            tokenUrl = provider.tokenUrl,
            userinfoUrl = provider.userinfoUrl,
            jwksUrl = provider.jwksUrl,
            endSessionUrl = provider.endSessionUrl,
            clientId = provider.clientId,
            clientSecretMasked = providerSecretCipher.mask(provider.clientSecret),
            clientAuthMethod = provider.clientAuthMethod,
            scopes = provider.scopes,
            usePkce = provider.usePkce,
            pkceMethod = provider.pkceMethod,
            prompt = provider.prompt,
            loginHintTemplate = provider.loginHintTemplate,
            domainMatchMode = provider.domainMatchMode,
            allowedEmailDomains = provider.allowedEmailDomains(),
            enforceSso = provider.enforceSso,
            autoProvisionUsers = provider.autoProvisionUsers,
            accountLinkPolicy = provider.accountLinkPolicy,
            profileSyncMode = provider.profileSyncMode,
            claimMapping = provider.claimMapping(),
            buttonText = provider.buttonText,
            buttonLogoUrl = provider.buttonLogoUrl,
            displayOrder = provider.displayOrder,
            enabled = provider.enabled,
            isDefault = provider.isDefault,
            lastTestedAt = provider.lastTestedAt?.toString(),
            lastTestResult = provider.lastTestResult
        )
}

private fun AuthProviderConfig.allowedEmailDomains(): List<String> =
    allowedEmailDomains?.split(",")
        ?.map { it.trim().lowercase() }
        ?.filter { it.isNotBlank() }
        ?.distinct()
        .orEmpty()

private fun List<String>.normalizedDomainList(): List<String> =
    map { it.trim().lowercase() }
        .filter { it.isNotBlank() }
        .distinct()
 
private fun List<String>.normalizedDomains(): String =
    normalizedDomainList().joinToString(",")

private fun AuthProviderConfig.claimMapping(): ClaimMappingConfig =
    runCatching {
        if (claimMappingJson.isNullOrBlank()) ClaimMappingConfig()
        else jacksonObjectMapper().readValue(claimMappingJson, ClaimMappingConfig::class.java)
    }.getOrElse { ClaimMappingConfig() }

private fun AuthenticatedUserResolver.runCatchingMembership(organizationId: Long): Boolean =
    runCatching { requireOrganizationAdmin(organizationId); true }.getOrDefault(false)

private fun AuthProviderConfig.copyForTest(
    providerSecretCipher: ProviderSecretCipher,
    request: TestAuthProviderRequest
): AuthProviderConfig =
    AuthProviderConfig(
        id = id,
        providerKey = providerKey,
        providerType = providerType,
        protocol = protocol,
        displayName = displayName,
        slug = slug,
        scopeLevel = scopeLevel,
        issuerUrl = request.issuerUrl ?: issuerUrl,
        discoveryUrl = request.discoveryUrl ?: discoveryUrl,
        clientId = request.clientId ?: clientId,
        clientSecret = providerSecretCipher.encrypt(request.clientSecret ?: providerSecretCipher.decrypt(clientSecret)),
        authorizationUrl = request.authorizationUrl ?: authorizationUrl,
        tokenUrl = request.tokenUrl ?: tokenUrl,
        userinfoUrl = request.userinfoUrl ?: userinfoUrl,
        jwksUrl = request.jwksUrl ?: jwksUrl,
        endSessionUrl = request.endSessionUrl ?: endSessionUrl,
        clientAuthMethod = clientAuthMethod,
        scopes = scopes,
        usePkce = usePkce,
        pkceMethod = pkceMethod,
        prompt = prompt,
        loginHintTemplate = loginHintTemplate,
        domainMatchMode = domainMatchMode,
        allowedEmailDomains = allowedEmailDomains,
        enforceSso = enforceSso,
        enabled = enabled,
        isDefault = isDefault,
        autoProvisionUsers = autoProvisionUsers,
        accountLinkPolicy = accountLinkPolicy,
        profileSyncMode = profileSyncMode,
        claimMappingJson = claimMappingJson,
        buttonText = buttonText,
        buttonLogoUrl = buttonLogoUrl,
        displayOrder = displayOrder,
        organizationId = organizationId,
        lastTestedAt = lastTestedAt,
        lastTestResult = lastTestResult,
        createdBy = createdBy,
        updatedBy = updatedBy,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
