package com.cruise.config

import com.cruise.entity.Project
import com.cruise.repository.ProjectRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
open class DataInitializer {

    @Bean
    open fun initData(projectRepository: ProjectRepository): CommandLineRunner {
        return CommandLineRunner {
            if (projectRepository.count() == 0L) {
                projectRepository.save(
                    Project(
                        name = "Test Project",
                        description = "Project for Phase 1 testing",
                        status = "ACTIVE"
                    )
                )
            }
        }
    }
}
