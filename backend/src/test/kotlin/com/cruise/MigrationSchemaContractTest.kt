package com.cruise

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.nio.file.Path
import kotlin.io.path.readText

class MigrationSchemaContractTest {

    @Test
    fun `project milestone project id is non-null in both vendor baselines`() {
        assertContainsProjectMilestoneNotNull(
            Path.of("src", "main", "resources", "db", "migration", "postgresql", "V1__baseline_schema.sql")
        )
        assertContainsProjectMilestoneNotNull(
            Path.of("src", "main", "resources", "db", "migration", "sqlite", "V1__baseline_schema.sql")
        )
    }

    private fun assertContainsProjectMilestoneNotNull(path: Path) {
        val normalized = path.readText()
            .replace("\r\n", "\n")
            .lowercase()
        val expectedColumn = "project_id bigint not null"
        val hasExpectedConstraint = Regex(
            """create table if not exists project_milestone\s*\((?s).*?\bproject_id\s+bigint\s+not\s+null\b"""
        ).containsMatchIn(normalized)

        assertTrue(
            hasExpectedConstraint,
            "Expected $expectedColumn in ${path.toAbsolutePath()}"
        )
    }
}
