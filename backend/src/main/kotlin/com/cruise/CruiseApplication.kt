package com.cruise

import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@ConfigurationPropertiesScan
@ComponentScan(basePackages = ["com.cruise"])
@EnableJpaRepositories(basePackages = ["com.cruise.repository"])
@EntityScan(basePackages = ["com.cruise.entity"])
@EnableScheduling
open class CruiseApplication

fun main(args: Array<String>) {
    runApplication<CruiseApplication>(*args)
}
