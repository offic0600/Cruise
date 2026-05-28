package com.cruise

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import org.springframework.boot.builder.SpringApplicationBuilder
import java.nio.file.Files
import java.nio.file.Path
import java.net.ServerSocket
import java.time.Duration
import java.time.Instant
import java.util.UUID

class PostgresqlBaselineSchemaValidationTest {

    private var postgresProcess: Process? = null
    private var dataDirectory: Path? = null

    @AfterEach
    fun cleanupPostgres() {
        postgresProcess?.let { process ->
            process.destroy()
            if (process.isAlive) {
                process.destroyForcibly()
            }
            process.waitFor()
        }
        dataDirectory?.let { directory ->
            runCatching {
                Files.walk(directory)
                    .sorted(Comparator.reverseOrder())
                    .forEach(Files::deleteIfExists)
            }
        }
    }

    @Test
    @Timeout(180)
    fun `postgres baseline schema supports application startup with ddl validate`() {
        assumeTrue(!isAdministrativeWindowsSession(), "local PostgreSQL startup validation is skipped in elevated Windows sessions")
        val resolvedPostgresBinDir = resolvePostgresBinDir()
        assumeTrue(resolvedPostgresBinDir != null, "local PostgreSQL binaries are required for PostgreSQL startup validation")
        val postgresBinDir = requireNotNull(resolvedPostgresBinDir)

        val hostPort = reserveHostPort()
        val initdb = postgresBinDir.resolve(executableName("initdb")).toString()
        val postgres = postgresBinDir.resolve(executableName("postgres")).toString()
        val pgIsReady = postgresBinDir.resolve(executableName("pg_isready")).toString()
        val username = "postgres"
        val database = "postgres"
        val dataDir = Files.createTempDirectory("cruise-postgres-data-")
        dataDirectory = dataDir

        val initResult = runCommand(
            initdb,
            "-D",
            dataDir.toString(),
            "-U",
            username,
            "-A",
            "trust",
            "--encoding=UTF8"
        )
        check(initResult.exitCode == 0) {
            "Failed to initialize PostgreSQL test data directory: ${initResult.stderr.ifBlank { initResult.stdout }}"
        }

        postgresProcess = ProcessBuilder(
            postgres,
            "-D",
            dataDir.toString(),
            "-p",
            hostPort.toString(),
            "-h",
            "127.0.0.1"
        )
            .redirectErrorStream(true)
            .start()

        waitForPostgres(pgIsReady, hostPort, username, database)

        val context = SpringApplicationBuilder(CruiseApplication::class.java)
            .properties(
                mapOf(
                    "spring.main.web-application-type" to "none",
                    "SPRING_DATASOURCE_URL" to "jdbc:postgresql://127.0.0.1:$hostPort/$database",
                    "SPRING_DATASOURCE_USERNAME" to username,
                    "SPRING_DATASOURCE_PASSWORD" to "",
                    "logging.level.root" to "WARN",
                    "logging.level.org.hibernate" to "WARN",
                    "logging.level.org.springframework" to "WARN"
                )
            )
            .run()

        context.close()
    }

    private fun waitForPostgres(pgIsReady: String, hostPort: Int, username: String, database: String) {
        val deadline = Instant.now().plus(Duration.ofSeconds(90))
        var lastFailure = "PostgreSQL container did not become ready"

        while (Instant.now().isBefore(deadline)) {
            val readyResult = runCommand(
                pgIsReady,
                "-h",
                "127.0.0.1",
                "-p",
                hostPort.toString(),
                "-U",
                username,
                "-d",
                database
            )
            if (readyResult.exitCode == 0) {
                return
            }
            lastFailure = readyResult.stderr.ifBlank { readyResult.stdout }
            Thread.sleep(1000)
        }

        val processOutput = postgresProcess?.inputStream?.bufferedReader()?.readText().orEmpty().trim()
        error("Timed out waiting for PostgreSQL readiness: ${listOf(lastFailure, processOutput).filter { it.isNotBlank() }.joinToString(" | ")}")
    }

    private fun reserveHostPort(): Int =
        ServerSocket(0).use { it.localPort }

    private fun isAdministrativeWindowsSession(): Boolean {
        if (!System.getProperty("os.name").orEmpty().lowercase().contains("win")) {
            return false
        }
        val groups = runCommand("whoami", "/groups")
        return groups.exitCode == 0 && groups.stdout.contains("BUILTIN\\Administrators")
    }

    private fun resolvePostgresBinDir(): Path? {
        val roots = listOfNotNull(
            System.getenv("ProgramFiles"),
            System.getenv("ProgramFiles(x86)")
        ).map { Path.of(it, "PostgreSQL") }

        roots.forEach { root ->
            if (!Files.isDirectory(root)) return@forEach
            Files.list(root).use { versions ->
                val latestBin = versions
                    .filter(Files::isDirectory)
                    .map { it.resolve("bin") }
                    .filter(Files::isDirectory)
                    .sorted { left, right -> right.fileName.toString().compareTo(left.fileName.toString()) }
                    .findFirst()
                if (latestBin.isPresent) {
                    return latestBin.get()
                }
            }
        }
        return null
    }

    private fun executableName(base: String): String =
        if (System.getProperty("os.name").orEmpty().lowercase().contains("win")) "$base.exe" else base

    private fun runCommand(vararg command: String): CommandResult {
        val process = ProcessBuilder(*command)
            .redirectErrorStream(false)
            .start()
        val stdout = process.inputStream.bufferedReader().readText().trim()
        val stderr = process.errorStream.bufferedReader().readText().trim()
        val exitCode = process.waitFor()
        return CommandResult(exitCode, stdout, stderr)
    }
}

private data class CommandResult(
    val exitCode: Int,
    val stdout: String,
    val stderr: String
)
