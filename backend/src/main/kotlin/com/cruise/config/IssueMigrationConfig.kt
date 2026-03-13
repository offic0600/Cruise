package com.cruise.config

import com.cruise.service.IssueService
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
open class IssueMigrationConfig {
    @Bean
    open fun issueMigrationRunner(issueService: IssueService): CommandLineRunner {
        return CommandLineRunner {
            issueService.migrateLegacyData()
        }
    }
}
