pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        maven { url = uri("https://repo1.maven.org/maven2") }
        mavenCentral()
    }
}

rootProject.name = "Cruise"
include("backend")
include("frontend")