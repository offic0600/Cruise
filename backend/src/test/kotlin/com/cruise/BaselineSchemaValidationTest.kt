package com.cruise

import org.junit.jupiter.api.Test
import org.springframework.boot.builder.SpringApplicationBuilder
import java.nio.file.Files
import java.nio.file.Path
import java.sql.DriverManager
import java.util.UUID
import kotlin.io.path.readText

class BaselineSchemaValidationTest {

    @Test
    fun `baseline schema supports application startup with ddl validate`() {
        val databaseName = "baseline_validate_${UUID.randomUUID().toString().replace("-", "")}"
        val jdbcUrl = "jdbc:h2:mem:$databaseName;DB_CLOSE_DELAY=-1"

        applyBaselineSchema(jdbcUrl)

        val context = SpringApplicationBuilder(CruiseApplication::class.java)
            .properties(
                mapOf(
                    "spring.main.web-application-type" to "none",
                    "spring.datasource.url" to jdbcUrl,
                    "spring.datasource.username" to "sa",
                    "spring.datasource.password" to "",
                    "spring.datasource.driver-class-name" to "org.h2.Driver",
                    "spring.jpa.hibernate.ddl-auto" to "validate",
                    "spring.sql.init.mode" to "never",
                    "logging.level.root" to "WARN",
                    "logging.level.org.hibernate" to "WARN",
                    "logging.level.org.springframework" to "WARN"
                )
            )
            .run()

        context.close()
    }

    private fun applyBaselineSchema(jdbcUrl: String) {
        val schemaPath = Path.of("src", "main", "resources", "db", "migration", "V1__baseline_schema.sql")
        val sql = schemaPath.readText()
        val statements = sql
            .lineSequence()
            .filterNot { it.trim().startsWith("--") }
            .joinToString("\n")
            .split(";")
            .map { it.trim() }
            .filter { it.isNotEmpty() }

        DriverManager.getConnection(jdbcUrl, "sa", "").use { connection ->
            connection.createStatement().use { statement ->
                statements.forEach(statement::execute)
            }
        }
    }
}
