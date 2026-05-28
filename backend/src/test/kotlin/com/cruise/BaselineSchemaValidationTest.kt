package com.cruise

import org.junit.jupiter.api.Test
import org.springframework.boot.builder.SpringApplicationBuilder
import java.nio.file.Path
import java.util.UUID

class BaselineSchemaValidationTest {

    @Test
    fun `baseline schema supports application startup with ddl validate`() {
        val sqlitePath = Path.of("build", "tmp", "baseline-validate-${UUID.randomUUID()}.db").toAbsolutePath()

        val context = SpringApplicationBuilder(CruiseApplication::class.java)
            .properties(
                mapOf(
                    "spring.main.web-application-type" to "none",
                    "CRUISE_SQLITE_PATH" to sqlitePath.toString(),
                    "spring.jpa.hibernate.ddl-auto" to "validate",
                    "logging.level.root" to "WARN",
                    "logging.level.org.hibernate" to "WARN",
                    "logging.level.org.springframework" to "WARN"
                )
            )
            .run()

        context.close()
    }
}
