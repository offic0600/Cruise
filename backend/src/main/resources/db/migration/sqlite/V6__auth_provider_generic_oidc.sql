ALTER TABLE auth_provider_config ADD COLUMN protocol VARCHAR(30) NOT NULL DEFAULT 'OIDC';
ALTER TABLE auth_provider_config ADD COLUMN slug VARCHAR(120);
ALTER TABLE auth_provider_config ADD COLUMN scope_level VARCHAR(30) NOT NULL DEFAULT 'GLOBAL';
ALTER TABLE auth_provider_config ADD COLUMN discovery_url VARCHAR(500);
ALTER TABLE auth_provider_config ADD COLUMN end_session_url VARCHAR(500);
ALTER TABLE auth_provider_config ADD COLUMN client_auth_method VARCHAR(50) NOT NULL DEFAULT 'client_secret_post';
ALTER TABLE auth_provider_config ADD COLUMN use_pkce BOOLEAN NOT NULL DEFAULT 1;
ALTER TABLE auth_provider_config ADD COLUMN pkce_method VARCHAR(20) NOT NULL DEFAULT 'S256';
ALTER TABLE auth_provider_config ADD COLUMN prompt VARCHAR(50);
ALTER TABLE auth_provider_config ADD COLUMN login_hint_template VARCHAR(255);
ALTER TABLE auth_provider_config ADD COLUMN domain_match_mode VARCHAR(30) NOT NULL DEFAULT 'NONE';
ALTER TABLE auth_provider_config ADD COLUMN allowed_email_domains VARCHAR(1000);
ALTER TABLE auth_provider_config ADD COLUMN enforce_sso BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE auth_provider_config ADD COLUMN account_link_policy VARCHAR(30) NOT NULL DEFAULT 'EMAIL_AUTO_LINK';
ALTER TABLE auth_provider_config ADD COLUMN profile_sync_mode VARCHAR(30) NOT NULL DEFAULT 'FIRST_LOGIN';
ALTER TABLE auth_provider_config ADD COLUMN claim_mapping_json TEXT;
ALTER TABLE auth_provider_config ADD COLUMN button_text VARCHAR(120);
ALTER TABLE auth_provider_config ADD COLUMN button_logo_url VARCHAR(500);
ALTER TABLE auth_provider_config ADD COLUMN display_order INT NOT NULL DEFAULT 0;
ALTER TABLE auth_provider_config ADD COLUMN last_tested_at TIMESTAMP;
ALTER TABLE auth_provider_config ADD COLUMN last_test_result VARCHAR(1000);
ALTER TABLE auth_provider_config ADD COLUMN created_by VARCHAR(100);
ALTER TABLE auth_provider_config ADD COLUMN updated_by VARCHAR(100);

UPDATE auth_provider_config
SET provider_type = 'OIDC',
    protocol = 'OIDC'
WHERE provider_type IN ('GOOGLE_OIDC', 'ENTERPRISE_OIDC');

ALTER TABLE oauth_login_session ADD COLUMN code_verifier VARCHAR(255);
ALTER TABLE oauth_login_session ADD COLUMN redirect_uri VARCHAR(500);
ALTER TABLE oauth_login_session ADD COLUMN organization_hint BIGINT;
ALTER TABLE oauth_login_session ADD COLUMN login_hint VARCHAR(255);
ALTER TABLE oauth_login_session ADD COLUMN requested_scopes VARCHAR(255);
ALTER TABLE oauth_login_session ADD COLUMN post_login_redirect VARCHAR(500);

ALTER TABLE user_identity ADD COLUMN issuer VARCHAR(500);
ALTER TABLE user_identity ADD COLUMN preferred_username VARCHAR(255);
ALTER TABLE user_identity ADD COLUMN name VARCHAR(255);
ALTER TABLE user_identity ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE user_identity ADD COLUMN raw_id_token_claims_json TEXT;
ALTER TABLE user_identity ADD COLUMN raw_userinfo_claims_json TEXT;
ALTER TABLE user_identity ADD COLUMN linked_at TIMESTAMP;
ALTER TABLE user_identity ADD COLUMN sync_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS auth_provider_domain (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id BIGINT NOT NULL,
    email_domain VARCHAR(255) NOT NULL UNIQUE
);
