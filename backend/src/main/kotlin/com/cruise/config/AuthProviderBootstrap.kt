package com.cruise.config

import com.cruise.entity.AuthProviderConfig
import com.cruise.repository.AuthProviderConfigRepository
import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Component
import java.time.LocalDateTime

@Component
class AuthProviderBootstrap(
    private val authProperties: AuthProperties,
    private val authProviderConfigRepository: AuthProviderConfigRepository,
    private val providerSecretCipher: com.cruise.service.ProviderSecretCipher
) {

    @PostConstruct
    fun syncProviders() {
        upsertEmailProvider()
        authProperties.oidcProviders.forEach(::upsertOidcProvider)
        upsertOidcProvider(authProperties.google)
        upsertOidcProvider(authProperties.enterprise)
    }

    private fun upsertEmailProvider() {
        val properties = authProperties.email
        val provider = authProviderConfigRepository.findByProviderKey(properties.providerKey) ?: AuthProviderConfig(
            providerKey = properties.providerKey
        )
        provider.protocol = "LOCAL"
        provider.providerType = properties.providerType
        provider.displayName = properties.displayName
        provider.enabled = properties.enabled
        provider.isDefault = properties.isDefault
        provider.autoProvisionUsers = properties.autoProvisionUsers
        provider.allowedEmailDomains = properties.allowedEmailDomains ?: properties.allowedDomains
        provider.updatedAt = LocalDateTime.now()
        if (provider.createdAt == LocalDateTime.MIN) {
            provider.createdAt = LocalDateTime.now()
        }
        authProviderConfigRepository.save(provider)
    }

    private fun upsertOidcProvider(properties: OidcProviderProperties) {
        if (properties.providerKey.isBlank()) return
        val provider = authProviderConfigRepository.findByProviderKey(properties.providerKey) ?: AuthProviderConfig(
            providerKey = properties.providerKey
        )
        provider.providerType = "OIDC"
        provider.protocol = properties.protocol
        provider.displayName = properties.displayName
        provider.slug = properties.slug
        provider.scopeLevel = properties.scopeLevel
        provider.organizationId = properties.organizationId
        provider.issuerUrl = properties.issuerUrl
        provider.discoveryUrl = properties.discoveryUrl
        provider.clientId = properties.clientId
        provider.clientSecret = providerSecretCipher.encrypt(properties.clientSecret)
        provider.authorizationUrl = properties.authorizationUrl
        provider.tokenUrl = properties.tokenUrl
        provider.userinfoUrl = properties.userinfoUrl
        provider.jwksUrl = properties.jwksUrl
        provider.endSessionUrl = properties.endSessionUrl
        provider.clientAuthMethod = properties.clientAuthMethod
        provider.scopes = properties.scopes
        provider.usePkce = properties.usePkce
        provider.pkceMethod = properties.pkceMethod
        provider.prompt = properties.prompt
        provider.loginHintTemplate = properties.loginHintTemplate
        provider.domainMatchMode = properties.domainMatchMode
        provider.allowedEmailDomains = properties.allowedEmailDomains
        provider.enforceSso = properties.enforceSso
        provider.enabled = properties.enabled
        provider.isDefault = properties.isDefault
        provider.autoProvisionUsers = properties.autoProvisionUsers
        provider.accountLinkPolicy = properties.accountLinkPolicy
        provider.profileSyncMode = properties.profileSyncMode
        provider.claimMappingJson = properties.claimMappingJson
        provider.buttonText = properties.buttonText
        provider.buttonLogoUrl = properties.buttonLogoUrl
        provider.displayOrder = properties.displayOrder
        provider.updatedAt = LocalDateTime.now()
        authProviderConfigRepository.save(provider)
    }
}
