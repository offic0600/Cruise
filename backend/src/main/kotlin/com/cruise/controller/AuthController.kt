package com.cruise.controller

import com.cruise.entity.User
import com.cruise.repository.MembershipRepository
import com.cruise.repository.UserRepository
import com.cruise.security.CustomUserDetailsService
import com.cruise.security.JwtTokenProvider
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*

private val logger = LoggerFactory.getLogger(AuthController::class.java)

// DTOs for JSON requests
data class LoginRequest(
    val username: String,
    val password: String
)

data class RegisterRequest(
    val username: String,
    val password: String,
    val email: String,
    val role: String = "USER"
)

data class AuthResponse(
    val token: String,
    val userId: Long,
    val username: String,
    val email: String,
    val role: String,
    val organizationId: Long?
)

@RestController
@RequestMapping("/api/auth", produces = [MediaType.APPLICATION_JSON_VALUE])
class AuthController(
    private val userRepository: UserRepository,
    private val membershipRepository: MembershipRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val customUserDetailsService: CustomUserDetailsService
) {

    @PostMapping("/register")
    fun register(@RequestBody request: RegisterRequest): ResponseEntity<*> {
        logger.info("Register request: username=${request.username}")

        if (userRepository.existsByUsername(request.username)) {
            return ResponseEntity.badRequest().body(mapOf("error" to "Username already exists"))
        }

        if (userRepository.existsByEmail(request.email)) {
            return ResponseEntity.badRequest().body(mapOf("error" to "Email already exists"))
        }

        val encodedPassword = passwordEncoder.encode(request.password)
        logger.info("Encoded password: ${encodedPassword.take(20)}...")

        val user = User(
            username = request.username,
            password = encodedPassword,
            email = request.email,
            role = request.role
        )

        userRepository.save(user)
        logger.info("User saved successfully")

        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("message" to "User registered successfully"))
    }

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<*> {
        logger.info("Login request: username=${request.username}")

        val user = userRepository.findByUsername(request.username)
        logger.info("User found: ${user != null}")

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to "User not found"))
        }

        logger.info("Stored password: ${user.password.take(20)}...")
        logger.info("Input password: ${request.password}")

        val matches = passwordEncoder.matches(request.password, user.password)
        logger.info("Password matches: $matches")

        if (!matches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to "Invalid password"))
        }

        // Generate JWT token
        val userDetails = customUserDetailsService.loadUserByUsername(user.username)
        val organizationId = membershipRepository.findFirstByUserIdAndActiveTrue(user.id)?.organizationId
        val token = jwtTokenProvider.generateToken(userDetails, user.id, organizationId, user.role)
        logger.info("Generated token: $token")

        val response = AuthResponse(
            token = token,
            userId = user.id,
            username = user.username,
            email = user.email,
            role = user.role,
            organizationId = organizationId
        )

        logger.info("Returning response: token=${response.token.take(20)}..., username=${response.username}")
        return ResponseEntity.ok(response)
    }
}
