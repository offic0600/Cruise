package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "auth_provider_domain",
    uniqueConstraints = [
        UniqueConstraint(name = "uk_auth_provider_domain_email_domain", columnNames = ["email_domain"])
    ]
)
class AuthProviderDomain(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "provider_id", nullable = false)
    var providerId: Long = 0,

    @Column(name = "email_domain", nullable = false, length = 255)
    var emailDomain: String = ""
)
