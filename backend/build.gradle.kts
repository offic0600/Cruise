// Cruise Backend — Spring Boot Application
plugins {
    id("org.springframework.boot")
    id("org.jetbrains.kotlin.jvm")
}

dependencies {
    // Spring Boot
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // Database
    runtimeOnly("org.postgresql:postgresql")

    // Kotlin
    implementation("org.jetbrains.kotlin:stdlib")
    implementation("org.jetbrains.kotlin:reflect")

    // JSON
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

kotlin {
    jvmToolchain(21)
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = "21"
    }
}

tasks.withType<org.springframework.boot.gradle.tasks.bundling.BootJar>().configureEach {
    mainClass.set("com.cruise.CruiseApplication")
}