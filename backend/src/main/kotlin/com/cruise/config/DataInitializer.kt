package com.cruise.config

import com.cruise.entity.User
import com.cruise.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.LocalDateTime

@Configuration(proxyBeanMethods = false)
open class DataInitializer {

    @Bean
    open fun initData(
        userRepository: UserRepository,
        passwordEncoder: PasswordEncoder
    ) = CommandLineRunner {
        val now = LocalDateTime.now()

        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(
                User(
                    username = "admin",
                    password = passwordEncoder.encode("admin123"),
                    email = "admin@cruise.local",
                    displayName = "Cruise Admin",
                    role = "ADMIN",
                    status = "ACTIVE",
                    createdAt = now,
                    updatedAt = now
                )
            )
        }

        if (!userRepository.existsByUsername("analyst")) {
            userRepository.save(
                User(
                    username = "analyst",
                    password = passwordEncoder.encode("analyst123"),
                    email = "analyst@cruise.local",
                    displayName = "Delivery Analyst",
                    role = "USER",
                    status = "ACTIVE",
                    createdAt = now,
                    updatedAt = now
                )
            )
        }
    }
}
