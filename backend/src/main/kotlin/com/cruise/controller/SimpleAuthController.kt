package com.cruise.controller

import com.cruise.entity.User
import com.cruise.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*

private val logger = LoggerFactory.getLogger(SimpleAuthController::class.java)

@RestController
@RequestMapping("/simple-auth", produces = [MediaType.APPLICATION_JSON_VALUE])
class SimpleAuthController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {

    @PostMapping("/register")
    fun register(
        @RequestParam username: String,
        @RequestParam password: String,
        @RequestParam email: String
    ): ResponseEntity<*> {
        try {
            val user = User(
                username = username,
                password = passwordEncoder.encode(password),
                email = email,
                role = "USER"
            )
            userRepository.save(user)
            logger.info("Registered user: $username")
            return ResponseEntity.ok(mapOf("status" to "registered"))
        } catch (e: Exception) {
            logger.error("Register error", e)
            return ResponseEntity.status(500).body(mapOf("error" to e.message))
        }
    }

    @PostMapping("/login")
    fun login(
        @RequestParam username: String,
        @RequestParam password: String
    ): ResponseEntity<*> {
        try {
            logger.info("Login attempt: username=$username, password=$password")
            logger.info("PasswordEncoder class: ${passwordEncoder.javaClass.name}")

            val user = userRepository.findByUsername(username)
            logger.info("User found: ${user != null}")

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to "not found"))
            }

            logger.info("Stored password (first 20): ${user.password.take(20)}")
            val matches = passwordEncoder.matches(password, user.password)
            logger.info("Password matches: $matches")

            if (matches) {
                return ResponseEntity.ok(mapOf("status" to "success", "user" to user.username))
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to "wrong password"))
            }
        } catch (e: Exception) {
            logger.error("Login error", e)
            return ResponseEntity.status(500).body(mapOf("error" to e.message))
        }
    }

    @GetMapping("/test")
    fun test(): ResponseEntity<*> {
        return ResponseEntity.ok(mapOf("status" to "ok"))
    }
}