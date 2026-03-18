package com.cruise.repository

import com.cruise.entity.AuthProviderConfig
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AuthProviderConfigRepository : JpaRepository<AuthProviderConfig, Long> {
    fun findByProviderKey(providerKey: String): AuthProviderConfig?
    fun findAllByEnabledTrueOrderByIsDefaultDescDisplayNameAsc(): List<AuthProviderConfig>
}
