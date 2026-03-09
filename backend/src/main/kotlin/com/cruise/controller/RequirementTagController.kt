package com.cruise.controller

import com.cruise.entity.RequirementTag
import com.cruise.service.CreateRequirementTagRequest
import com.cruise.service.RequirementTagService
import com.cruise.service.UpdateRequirementTagRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/requirement-tags")
class RequirementTagController(
    private val service: RequirementTagService
) {
    @GetMapping
    fun getAll(): List<RequirementTag> = service.findAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): RequirementTag = service.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateRequirementTagRequest): ResponseEntity<RequirementTag> {
        val tag = service.create(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(tag)
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody request: UpdateRequirementTagRequest
    ): RequirementTag = service.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
