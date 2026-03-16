package com.cruise.security

import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.util.Date
import javax.crypto.SecretKey

@Component
class JwtTokenProvider {

    @Value("\${jwt.secret}")
    private val jwtSecret: String = "cruise-secret-key-for-jwt-token-generation-must-be-long-enough"

    @Value("\${jwt.expiration}")
    private val jwtExpiration: Long = 86400000 // 24 hours

    private fun getSigningKey(): SecretKey {
        return Keys.hmacShaKeyFor(jwtSecret.toByteArray(StandardCharsets.UTF_8))
    }

    fun generateToken(
        userDetails: UserDetails,
        userId: Long? = null,
        organizationId: Long? = null,
        role: String? = null
    ): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtExpiration)

        val builder = Jwts.builder()
            .subject(userDetails.username)
            .issuedAt(now)
            .expiration(expiryDate)
        if (userId != null) builder.claim("userId", userId)
        if (organizationId != null) builder.claim("organizationId", organizationId)
        if (!role.isNullOrBlank()) builder.claim("role", role)
        return builder.signWith(getSigningKey()).compact()
    }

    fun getUsernameFromToken(token: String): String {
        val claims = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .payload

        return claims.subject
    }

    fun validateToken(token: String): Boolean {
        return try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
            true
        } catch (e: MalformedJwtException) {
            false
        } catch (e: ExpiredJwtException) {
            false
        } catch (e: UnsupportedJwtException) {
            false
        } catch (e: IllegalArgumentException) {
            false
        }
    }
}
