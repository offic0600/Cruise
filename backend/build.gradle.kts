// Cruise Backend — Spring Boot Application
repositories {
    mavenCentral()
}

plugins {
    id("org.springframework.boot") version "3.2.5"
    id("org.jetbrains.kotlin.jvm") version "1.9.23"
    id("org.jetbrains.kotlin.plugin.spring") version "1.9.23"
    id("org.jetbrains.kotlin.plugin.allopen") version "1.9.23"
}

// 配置 all-open，让 @Transactional 注解的类自动变为 open
allOpen {
    annotation("org.springframework.transaction.annotation.Transactional")
}

// 直接使用系统 Java
java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

// 导入 BOM - Spring Boot 管理所有版本
val springBootVersion = "3.2.5"

dependencies {
    // Spring Boot BOM - 让它管理所有传递依赖版本
    implementation(platform("org.springframework.boot:spring-boot-dependencies:$springBootVersion"))
    testImplementation(platform("org.springframework.boot:spring-boot-dependencies:$springBootVersion"))

    // Spring Boot starters
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-mail")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.5")

    // Database
    runtimeOnly("com.h2database:h2")
    runtimeOnly("org.postgresql:postgresql")

    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // JSON
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // HTTP Client (用于调用 Claude API)
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = "21"
    }
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}

tasks.withType<org.springframework.boot.gradle.tasks.bundling.BootJar>().configureEach {
    mainClass.set("com.cruise.CruiseApplicationKt")
}
