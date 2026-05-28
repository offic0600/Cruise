package com.cruise.config

import com.cruise.entity.Issue
import com.cruise.repository.IssueRepository
import com.cruise.service.IssueCustomFieldService
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.jdbc.core.JdbcTemplate
import java.sql.Connection

@Configuration
open class LegacyIssuePayloadCleanupConfig {

    @Bean
    @Order(1)
    open fun backfillLegacyIssuePayloads(
        jdbcTemplate: JdbcTemplate,
        issueRepository: IssueRepository,
        issueCustomFieldService: IssueCustomFieldService,
        objectMapper: ObjectMapper
    ): CommandLineRunner {
        return CommandLineRunner {
            migrateIssuePayloads(jdbcTemplate, issueRepository, issueCustomFieldService, objectMapper)
            migrateJsonResources(jdbcTemplate, objectMapper, "issue_draft")
            migrateJsonResources(jdbcTemplate, objectMapper, "issue_template")
            migrateJsonResources(jdbcTemplate, objectMapper, "recurring_issue_definition")
        }
    }

    private fun migrateIssuePayloads(
        jdbcTemplate: JdbcTemplate,
        issueRepository: IssueRepository,
        issueCustomFieldService: IssueCustomFieldService,
        objectMapper: ObjectMapper
    ) {
        if (!columnExists(jdbcTemplate, "ISSUE", "LEGACY_PAYLOAD")) return

        val rows = jdbcTemplate.query(
            """
            select id, legacy_payload
            from issue
            where legacy_payload is not null and trim(legacy_payload) <> ''
            order by id
            """.trimIndent()
        ) { rs, _ -> rs.getLong("id") to rs.getString("legacy_payload") }

        rows.forEach { (issueId, rawPayload) ->
            val issue = issueRepository.findById(issueId).orElse(null) ?: return@forEach
            val payload = parseMap(objectMapper, rawPayload)
            if (payload.isNotEmpty()) {
                issueCustomFieldService.replaceIssueValues(
                    issue,
                    issueCustomFieldService.getValuesForIssue(issue) + payload
                )
            }
            jdbcTemplate.update("update issue set legacy_payload = null where id = ?", issueId)
        }
    }

    private fun migrateJsonResources(
        jdbcTemplate: JdbcTemplate,
        objectMapper: ObjectMapper,
        tableName: String
    ) {
        if (!columnExists(jdbcTemplate, tableName, "LEGACY_PAYLOAD") ||
            !columnExists(jdbcTemplate, tableName, "CUSTOM_FIELDS_JSON")
        ) {
            return
        }

        val rows = jdbcTemplate.query(
            """
            select id, legacy_payload, custom_fields_json
            from $tableName
            where legacy_payload is not null and trim(legacy_payload) <> ''
            order by id
            """.trimIndent()
        ) { rs, _ ->
            Triple(
                rs.getLong("id"),
                rs.getString("legacy_payload"),
                rs.getString("custom_fields_json")
            )
        }

        rows.forEach { (id, rawPayload, rawCustomFields) ->
            val payload = parseMap(objectMapper, rawPayload)
            val customFields = parseMap(objectMapper, rawCustomFields)
            val merged = payload + customFields
            jdbcTemplate.update(
                "update $tableName set custom_fields_json = ?, legacy_payload = null where id = ?",
                objectMapper.writeValueAsString(merged),
                id
            )
        }
    }

    private fun parseMap(objectMapper: ObjectMapper, raw: String?): Map<String, Any?> {
        if (raw.isNullOrBlank()) return emptyMap()
        return runCatching {
            objectMapper.readValue(raw, object : TypeReference<Map<String, Any?>>() {})
        }.getOrElse { emptyMap() }
    }

    private fun columnExists(
        jdbcTemplate: JdbcTemplate,
        tableName: String,
        columnName: String
    ): Boolean =
        jdbcTemplate.dataSource?.connection?.use { connection ->
            if (connection.isSqlite()) {
                sqliteColumnExists(connection, tableName, columnName)
            } else {
                connection.metaData.getColumns(null, null, tableName, columnName).use { columns ->
                    generateSequence {
                        if (columns.next()) columns.getString("COLUMN_NAME") else null
                    }.any { it.equals(columnName, ignoreCase = true) }
                }
            }
        } ?: false

    private fun sqliteColumnExists(
        connection: Connection,
        tableName: String,
        columnName: String
    ): Boolean {
        val safeTableName = requireSqlIdentifier(tableName)
        connection.createStatement().use { statement ->
            statement.executeQuery("""pragma table_info("$safeTableName")""").use { columns ->
                return generateSequence {
                    if (columns.next()) columns.getString("name") else null
                }.any { it.equals(columnName, ignoreCase = true) }
            }
        }
    }

    private fun Connection.isSqlite(): Boolean =
        metaData.databaseProductName.equals("SQLite", ignoreCase = true)

    private fun requireSqlIdentifier(identifier: String): String {
        require(identifier.matches(Regex("[A-Za-z_][A-Za-z0-9_]*"))) {
            "Unsafe SQL identifier: $identifier"
        }
        return identifier
    }
}
