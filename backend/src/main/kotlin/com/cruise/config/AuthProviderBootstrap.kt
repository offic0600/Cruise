package com.cruise.config

import com.cruise.entity.AuthProviderConfig
import com.cruise.repository.AuthProviderConfigRepository
import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Component
import java.time.LocalDateTime

@Component
class AuthProviderBootstrap(
    private val authProperties: AuthProperties,
    private val authProviderConfigRepository: AuthProviderConfigRepository
) {

    @PostConstruct
    fun syncProviders() {
        upsertEmailProvider()
        upsertOidcProvider(authProperties.google)
        upsertOidcProvider(authProperties.enterprise)
    }

    private fun upsertEmailProvider() {
        val properties = authProperties.email
        val provider = authProviderConfigRepository.findByProviderKey(properties.providerKey) ?: AuthProviderConfig(
            providerKey = properties.providerKey
        )
        provider.providerType = properties.providerType
        provider.displayName = properties.displayName
        provider.enabled = properties.enabled
        provider.isDefault = properties.isDefault
        provider.autoProvisionUsers = properties.autoProvisionUsers
        provider.allowedDomains = properties.allowedDomains
        provider.updatedAt = LocalDateTime.now()
        if (provider.createdAt == LocalDateTime.MIN) {
            provider.createdAt = LocalDateTime.now()
        }
        authProviderConfigRepository.save(provider)
    }

    private fun upsertOidcProvider(properties: OidcProviderProperties) {
        val provider = authProviderConfigRepository.findByProviderKey(properties.providerKey) ?: AuthProviderConfig(
            providerKey = properties.providerKey
        )
        provider.providerType = properties.providerType
        provider.displayName = properties.displayName
        provider.issuerUrl = properties.issuerUrl
        provider.clientId = properties.clientId
        provider.clientSecret = properties.clientSecret
        provider.authorizationUrl = properties.authorizationUrl
        provider.tokenUrl = properties.tokenUrl
        provider.userinfoUrl = properties.userinfoUrl
        provider.jwksUrl = properties.jwksUrl
        provider.scopes = properties.scopes
        provider.enabled = properties.enabled
        provider.isDefault = properties.isDefault
        provider.autoProvisionUsers = properties.autoProvisionUsers
        provider.allowedDomains = properties.allowedDomains
        provider.updatedAt = LocalDateTime.now()
        authProviderConfigRepository.save(provider)
    }
}
