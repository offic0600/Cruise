package com.cruise.skill

abstract class BaseSkill {
    abstract fun getName(): String
    abstract fun getDescription(): String
    abstract fun getCategory(): String
    abstract fun getIntentPatterns(): List<String>
    abstract fun execute(input: String): String
}
