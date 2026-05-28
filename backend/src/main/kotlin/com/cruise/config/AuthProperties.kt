package com.cruise.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "cruise.auth")
data class AuthProperties(
    var frontendBaseUrl: String = "http://localhost:3000",
    var backendBaseUrl: String = "http://localhost:8080",
    var legacyPasswordEnabled: Boolean = true,
    var defaultOrganizationSlug: String = "cruise",
    var providerSecretKey: String = "cruise-provider-secret-key",
    var magicLink: MagicLinkProperties = MagicLinkProperties(),
    var oidcProviders: List<OidcProviderProperties> = emptyList(),
    var google: OidcProviderProperties = OidcProviderProperties(
        providerKey = "google",
        providerType = "OIDC",
        protocol = "OIDC",
        displayName = "Google",
        authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl = "https://oauth2.googleapis.com/token",
        userinfoUrl = "https://openidconnect.googleapis.com/v1/userinfo",
        scopes = "openid profile email"
    ),
    var enterprise: OidcProviderProperties = OidcProviderProperties(
        providerKey = "enterprise",
        providerType = "OIDC",
        protocol = "OIDC",
        displayName = "Enterprise SSO"
    ),
    var email: EmailProviderProperties = EmailProviderProperties()
)

data class MagicLinkProperties(
    var enabled: Boolean = true,
    var tokenTtlMinutes: Long = 15,
    var callbackPath: String = "/login/callback",
    var fromAddress: String = "noreply@cruise.local"
)

data class OidcProviderProperties(
    var enabled: Boolean = false,
    var providerKey: String = "",
    var providerType: String = "OIDC",
    var protocol: String = "OIDC",
    var displayName: String = "",
    var slug: String? = null,
    var scopeLevel: String = "GLOBAL",
    var organizationId: Long? = null,
    var issuerUrl: String? = null,
    var discoveryUrl: String? = null,
    var clientId: String? = null,
    var clientSecret: String? = null,
    var authorizationUrl: String? = null,
    var tokenUrl: String? = null,
    var userinfoUrl: String? = null,
    var jwksUrl: String? = null,
    var endSessionUrl: String? = null,
    var clientAuthMethod: String = "client_secret_post",
    var scopes: String = "openid profile email",
    var usePkce: Boolean = true,
    var pkceMethod: String = "S256",
    var prompt: String? = null,
    var loginHintTemplate: String? = null,
    var domainMatchMode: String = "NONE",
    var allowedEmailDomains: String? = null,
    var enforceSso: Boolean = false,
    var autoProvisionUsers: Boolean = true,
    var accountLinkPolicy: String = "EMAIL_AUTO_LINK",
    var profileSyncMode: String = "FIRST_LOGIN",
    var claimMappingJson: String? = null,
    var buttonText: String? = null,
    var buttonLogoUrl: String? = null,
    var displayOrder: Int = 0,
    var isDefault: Boolean = false
)

data class EmailProviderProperties(
    var enabled: Boolean = true,
    var providerKey: String = "email",
    var providerType: String = "EMAIL_MAGIC_LINK",
    var displayName: String = "Email link",
    var autoProvisionUsers: Boolean = true,
    var allowedDomains: String? = null,
    var allowedEmailDomains: String? = null,
    var isDefault: Boolean = true
)
