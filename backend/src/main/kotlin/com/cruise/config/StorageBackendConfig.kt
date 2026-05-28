package com.cruise.config

import com.zaxxer.hikari.HikariDataSource
import org.springframework.boot.autoconfigure.flyway.FlywayConfigurationCustomizer
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.core.env.Environment
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import javax.sql.DataSource

enum class DatabaseBackend {
    POSTGRESQL,
    SQLITE
}

data class DatabaseRuntimeSettings(
    val backend: DatabaseBackend,
    val jdbcUrl: String,
    val driverClassName: String,
    val username: String? = null,
    val password: String? = null,
    val hibernateDialect: String,
    val flywayLocations: List<String>
)

@Configuration(proxyBeanMethods = false)
open class StorageBackendConfig {

    @Bean
    open fun databaseRuntimeSettings(environment: Environment): DatabaseRuntimeSettings {
        val configuredUrl = environment.getProperty("SPRING_DATASOURCE_URL")?.trim().orEmpty()
        if (configuredUrl.isNotBlank()) {
            require(configuredUrl.startsWith("jdbc:postgresql:")) {
                "SPRING_DATASOURCE_URL must be a PostgreSQL JDBC URL when configured."
            }
            return DatabaseRuntimeSettings(
                backend = DatabaseBackend.POSTGRESQL,
                jdbcUrl = configuredUrl,
                driverClassName = "org.postgresql.Driver",
                username = environment.getProperty("SPRING_DATASOURCE_USERNAME"),
                password = environment.getProperty("SPRING_DATASOURCE_PASSWORD"),
                hibernateDialect = "org.hibernate.dialect.PostgreSQLDialect",
                flywayLocations = listOf("classpath:db/migration/postgresql")
            )
        }

        val sqlitePath = resolveSqlitePath(environment)
        ensureSqlitePath(sqlitePath)
        return DatabaseRuntimeSettings(
            backend = DatabaseBackend.SQLITE,
            jdbcUrl = "jdbc:sqlite:${sqlitePath.toAbsolutePath().normalize()}",
            driverClassName = "org.sqlite.JDBC",
            hibernateDialect = "org.hibernate.community.dialect.SQLiteDialect",
            flywayLocations = listOf("classpath:db/migration/sqlite")
        )
    }

    @Bean
    @Primary
    open fun dataSource(settings: DatabaseRuntimeSettings): DataSource =
        HikariDataSource().apply {
            jdbcUrl = settings.jdbcUrl
            driverClassName = settings.driverClassName
            when (settings.backend) {
                DatabaseBackend.POSTGRESQL -> {
                    username = settings.username
                    password = settings.password
                }

                DatabaseBackend.SQLITE -> {
                    maximumPoolSize = 1
                    minimumIdle = 1
                    connectionInitSql = "PRAGMA foreign_keys=ON"
                }
            }
        }

    @Bean
    open fun flywayConfigurationCustomizer(settings: DatabaseRuntimeSettings): FlywayConfigurationCustomizer =
        FlywayConfigurationCustomizer { configuration ->
            configuration.locations(*settings.flywayLocations.toTypedArray())
        }

    @Bean
    open fun hibernatePropertiesCustomizer(settings: DatabaseRuntimeSettings): HibernatePropertiesCustomizer =
        HibernatePropertiesCustomizer { properties ->
            properties["hibernate.dialect"] = settings.hibernateDialect
            if (settings.backend == DatabaseBackend.SQLITE) {
                properties["hibernate.hbm2ddl.auto"] = "none"
                properties["hibernate.hbm2ddl.jdbc_metadata_extraction_strategy"] = "individually"
            }
        }

    private fun resolveSqlitePath(environment: Environment): Path {
        val configured = environment.getProperty("CRUISE_SQLITE_PATH")?.trim().orEmpty()
        if (configured.isNotBlank()) {
            return Paths.get(configured)
        }

        val osName = System.getProperty("os.name")?.lowercase().orEmpty()
        return if ("win" in osName) {
            Paths.get(System.getProperty("user.home"), ".cruise", "cruise.db")
        } else {
            Paths.get("/var/lib/cruise/cruise.db")
        }
    }

    private fun ensureSqlitePath(path: Path) {
        val normalized = path.toAbsolutePath().normalize()
        val parent = normalized.parent
            ?: throw IllegalStateException("Resolved SQLite path must have a parent directory: $normalized")

        try {
            Files.createDirectories(parent)
            if (Files.exists(normalized) && Files.isDirectory(normalized)) {
                throw IllegalStateException("Resolved SQLite path points to a directory: $normalized")
            }
            if (Files.notExists(normalized)) {
                Files.createFile(normalized)
            }
            if (!Files.isWritable(normalized)) {
                throw IllegalStateException("SQLite database file is not writable: $normalized")
            }
        } catch (ex: Exception) {
            throw IllegalStateException("Failed to prepare SQLite database path: $normalized", ex)
        }
    }
}
