package com.cruise.controller

import com.cruise.service.CreateNotificationRequest
import com.cruise.service.NotificationDto
import com.cruise.service.NotificationQuery
import com.cruise.service.NotificationService
import com.cruise.service.UpdateNotificationRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/notifications")
class NotificationController(
    private val notificationService: NotificationService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) userId: Long?,
        @RequestParam(required = false, defaultValue = "false") unreadOnly: Boolean,
        @RequestParam(required = false) type: String?
    ): List<NotificationDto> = notificationService.findAll(
        NotificationQuery(
            userId = userId,
            unreadOnly = unreadOnly,
            type = type
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): NotificationDto = notificationService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateNotificationRequest): ResponseEntity<NotificationDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(notificationService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateNotificationRequest): NotificationDto =
        notificationService.update(id, request)

    @PatchMapping("/{id}/read")
    fun markRead(@PathVariable id: Long): NotificationDto = notificationService.markRead(id)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        notificationService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
