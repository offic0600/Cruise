// Cruise — Root Build Configuration
plugins {
    id("org.springframework.boot") version "3.3.5" apply false
    id("org.jetbrains.kotlin.jvm") version "1.9.25" apply false
}

tasks.register("clean", Delete::class) {
    delete(rootProject.layout.buildDirectory)
}