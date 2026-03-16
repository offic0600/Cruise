package com.cruise.controller

import com.cruise.service.ActivityEventDto
import com.cruise.service.ActivityEventQuery
import com.cruise.service.ActivityEventService
import com.cruise.service.CreateActivityEventRequest
import com.cruise.service.UpdateActivityEventRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/activity")
class ActivityEventController(
    private val activityEventService: ActivityEventService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) actorId: Long?,
        @RequestParam(required = false) entityType: String?,
        @RequestParam(required = false) entityId: Long?,
        @RequestParam(required = false) actionType: String?
    ): List<ActivityEventDto> = activityEventService.findAll(
        ActivityEventQuery(
            actorId = actorId,
            entityType = entityType,
            entityId = entityId,
            actionType = actionType
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ActivityEventDto = activityEventService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateActivityEventRequest): ResponseEntity<ActivityEventDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(activityEventService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateActivityEventRequest): ActivityEventDto =
        activityEventService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        activityEventService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
