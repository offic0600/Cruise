package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "auth_provider_config")
class AuthProviderConfig(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "provider_key", nullable = false, unique = true, length = 100)
    var providerKey: String = "",

    @Column(name = "provider_type", nullable = false, length = 50)
    var providerType: String = "",

    @Column(nullable = false, length = 30)
    var protocol: String = "OIDC",

    @Column(name = "display_name", nullable = false, length = 120)
    var displayName: String = "",

    @Column(length = 120)
    var slug: String? = null,

    @Column(name = "scope_level", nullable = false, length = 30)
    var scopeLevel: String = "GLOBAL",

    @Column(name = "issuer_url", length = 500)
    var issuerUrl: String? = null,

    @Column(name = "discovery_url", length = 500)
    var discoveryUrl: String? = null,

    @Column(name = "client_id", length = 255)
    var clientId: String? = null,

    @Column(name = "client_secret", length = 500)
    var clientSecret: String? = null,

    @Column(name = "authorization_url", length = 500)
    var authorizationUrl: String? = null,

    @Column(name = "token_url", length = 500)
    var tokenUrl: String? = null,

    @Column(name = "userinfo_url", length = 500)
    var userinfoUrl: String? = null,

    @Column(name = "jwks_url", length = 500)
    var jwksUrl: String? = null,

    @Column(name = "end_session_url", length = 500)
    var endSessionUrl: String? = null,

    @Column(name = "client_auth_method", nullable = false, length = 50)
    var clientAuthMethod: String = "client_secret_post",

    @Column(length = 255)
    var scopes: String? = null,

    @Column(name = "use_pkce", nullable = false)
    var usePkce: Boolean = true,

    @Column(name = "pkce_method", nullable = false, length = 20)
    var pkceMethod: String = "S256",

    @Column(length = 50)
    var prompt: String? = null,

    @Column(name = "login_hint_template", length = 255)
    var loginHintTemplate: String? = null,

    @Column(name = "domain_match_mode", nullable = false, length = 30)
    var domainMatchMode: String = "NONE",

    @Column(name = "allowed_email_domains", length = 1000)
    var allowedEmailDomains: String? = null,

    @Column(name = "enforce_sso", nullable = false)
    var enforceSso: Boolean = false,

    @Column(nullable = false)
    var enabled: Boolean = false,

    @Column(name = "is_default", nullable = false)
    var isDefault: Boolean = false,

    @Column(name = "auto_provision_users", nullable = false)
    var autoProvisionUsers: Boolean = true,

    @Column(name = "account_link_policy", nullable = false, length = 30)
    var accountLinkPolicy: String = "EMAIL_AUTO_LINK",

    @Column(name = "profile_sync_mode", nullable = false, length = 30)
    var profileSyncMode: String = "FIRST_LOGIN",

    @Lob
    @Column(name = "claim_mapping_json")
    var claimMappingJson: String? = null,

    @Column(name = "button_text", length = 120)
    var buttonText: String? = null,

    @Column(name = "button_logo_url", length = 500)
    var buttonLogoUrl: String? = null,

    @Column(name = "display_order", nullable = false)
    var displayOrder: Int = 0,

    @Column(name = "organization_id")
    var organizationId: Long? = null,

    @Column(name = "last_tested_at")
    var lastTestedAt: LocalDateTime? = null,

    @Column(name = "last_test_result", length = 1000)
    var lastTestResult: String? = null,

    @Column(name = "created_by", length = 100)
    var createdBy: String? = null,

    @Column(name = "updated_by", length = 100)
    var updatedBy: String? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
