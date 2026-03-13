// Cruise — Root Build Configuration
plugins {
    id("org.springframework.boot") version "3.2.5" apply false
    id("org.jetbrains.kotlin.jvm") version "1.9.23" apply false
}

tasks.register("clean", Delete::class) {
    delete(rootProject.layout.buildDirectory)
}