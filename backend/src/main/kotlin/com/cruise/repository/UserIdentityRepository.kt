package com.cruise.repository

import com.cruise.entity.UserIdentity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserIdentityRepository : JpaRepository<UserIdentity, Long> {
    fun findByProviderKeyAndSubject(providerKey: String, subject: String): UserIdentity?
    fun findAllByUserId(userId: Long): List<UserIdentity>
}
