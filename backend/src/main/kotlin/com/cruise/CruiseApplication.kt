package com.cruise

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
open class CruiseApplication

fun main(args: Array<String>) {
    runApplication<CruiseApplication>(*args)
}