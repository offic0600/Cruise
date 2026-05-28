package com.cruise.config

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.springframework.mock.env.MockEnvironment
import java.nio.file.Files
import java.nio.file.Path

class StorageBackendConfigTest {

    private val config = StorageBackendConfig()

    @Test
    fun `uses postgres when datasource url is configured`() {
        val environment = MockEnvironment()
            .withProperty("SPRING_DATASOURCE_URL", "jdbc:postgresql://localhost:5432/cruise")
            .withProperty("SPRING_DATASOURCE_USERNAME", "cruise")
            .withProperty("SPRING_DATASOURCE_PASSWORD", "secret")
            .withProperty("CRUISE_SQLITE_PATH", "ignored.db")

        val settings = config.databaseRuntimeSettings(environment)

        assertEquals(DatabaseBackend.POSTGRESQL, settings.backend)
        assertEquals("jdbc:postgresql://localhost:5432/cruise", settings.jdbcUrl)
        assertEquals("org.postgresql.Driver", settings.driverClassName)
        assertEquals("cruise", settings.username)
        assertEquals("secret", settings.password)
        assertEquals(listOf("classpath:db/migration/postgresql"), settings.flywayLocations)
        assertEquals("org.hibernate.dialect.PostgreSQLDialect", settings.hibernateDialect)
    }

    @Test
    fun `falls back to sqlite and creates file when datasource url is missing`(@TempDir tempDir: Path) {
        val sqlitePath = tempDir.resolve("sqlite").resolve("cruise.db")
        val environment = MockEnvironment()
            .withProperty("CRUISE_SQLITE_PATH", sqlitePath.toString())

        val settings = config.databaseRuntimeSettings(environment)

        assertEquals(DatabaseBackend.SQLITE, settings.backend)
        assertTrue(Files.exists(sqlitePath))
        assertEquals("org.sqlite.JDBC", settings.driverClassName)
        assertEquals(listOf("classpath:db/migration/sqlite"), settings.flywayLocations)
        assertTrue(settings.jdbcUrl.startsWith("jdbc:sqlite:"))
    }
}
