package com.cruise.repository

import com.cruise.entity.AuthProviderDomain
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AuthProviderDomainRepository : JpaRepository<AuthProviderDomain, Long> {
    fun findAllByProviderId(providerId: Long): List<AuthProviderDomain>
    fun deleteAllByProviderId(providerId: Long)
    fun findByEmailDomain(emailDomain: String): AuthProviderDomain?
    fun existsByEmailDomainAndProviderIdNot(emailDomain: String, providerId: Long): Boolean
}
