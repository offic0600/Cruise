package com.cruise.controller

import com.cruise.entity.SkillDefinition
import com.cruise.service.SkillAnalytics
import com.cruise.service.SkillService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/skills")
class SkillController(
    private val skillService: SkillService
) {
    @GetMapping
    fun getAllSkills(): List<SkillDefinition> {
        return skillService.getAllSkills()
    }

    @GetMapping("/{name}")
    fun getSkillByName(@PathVariable name: String): ResponseEntity<SkillDefinition> {
        val skill = skillService.getSkillByName(name)
        return if (skill != null) {
            ResponseEntity.ok(skill)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/category/{category}")
    fun getSkillsByCategory(@PathVariable category: String): List<SkillDefinition> {
        return skillService.getSkillsByCategory(category)
    }

    @GetMapping("/names")
    fun getSkillNames(): List<String> {
        return skillService.getSkillNames()
    }

    @GetMapping("/analytics/{name}")
    fun getSkillAnalytics(@PathVariable name: String): ResponseEntity<SkillAnalytics> {
        return try {
            val analytics = skillService.getSkillAnalytics(name)
            ResponseEntity.ok(analytics)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping
    fun createSkill(@RequestBody request: CreateSkillRequest): ResponseEntity<SkillDefinition> {
        return try {
            val skill = skillService.createSkill(request)
            ResponseEntity.ok(skill)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{name}")
    fun updateSkill(@PathVariable name: String, @RequestBody request: UpdateSkillRequest): ResponseEntity<SkillDefinition> {
        return try {
            val skill = skillService.updateSkill(name, request)
            ResponseEntity.ok(skill)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/{name}")
    fun deleteSkill(@PathVariable name: String): ResponseEntity<Void> {
        return try {
            skillService.deleteSkill(name)
            ResponseEntity.ok().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/external")
    fun addExternalSkill(@RequestBody request: AddExternalSkillRequest): ResponseEntity<SkillDefinition> {
        return try {
            val skill = skillService.addExternalSkill(request)
            ResponseEntity.ok(skill)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }
}

data class CreateSkillRequest(
    val name: String,
    val description: String,
    val category: String,
    val intentPatterns: String,
    val parameters: String? = null,
    val outputSchema: String? = null
)

data class UpdateSkillRequest(
    val description: String? = null,
    val category: String? = null,
    val intentPatterns: String? = null,
    val parameters: String? = null,
    val outputSchema: String? = null,
    val status: String? = null
)

data class AddExternalSkillRequest(
    val name: String,
    val description: String,
    val category: String,
    val externalUrl: String,
    val apiKey: String? = null
)
