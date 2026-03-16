package com.cruise.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "cruise.auth")
data class AuthProperties(
    var frontendBaseUrl: String = "http://localhost:3000",
    var legacyPasswordEnabled: Boolean = true,
    var defaultOrganizationSlug: String = "cruise",
    var magicLink: MagicLinkProperties = MagicLinkProperties(),
    var google: OidcProviderProperties = OidcProviderProperties(
        providerKey = "google",
        providerType = "GOOGLE_OIDC",
        displayName = "Google",
        authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl = "https://oauth2.googleapis.com/token",
        userinfoUrl = "https://openidconnect.googleapis.com/v1/userinfo",
        scopes = "openid profile email"
    ),
    var enterprise: OidcProviderProperties = OidcProviderProperties(
        providerKey = "enterprise",
        providerType = "ENTERPRISE_OIDC",
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
    var providerType: String = "",
    var displayName: String = "",
    var issuerUrl: String? = null,
    var clientId: String? = null,
    var clientSecret: String? = null,
    var authorizationUrl: String? = null,
    var tokenUrl: String? = null,
    var userinfoUrl: String? = null,
    var jwksUrl: String? = null,
    var scopes: String = "openid profile email",
    var autoProvisionUsers: Boolean = true,
    var allowedDomains: String? = null,
    var isDefault: Boolean = false
)

data class EmailProviderProperties(
    var enabled: Boolean = true,
    var providerKey: String = "email",
    var providerType: String = "EMAIL_MAGIC_LINK",
    var displayName: String = "Email link",
    var autoProvisionUsers: Boolean = true,
    var allowedDomains: String? = null,
    var isDefault: Boolean = true
)
