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
}
