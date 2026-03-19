package com.cruise.controller

import com.cruise.service.CreateNotificationRequest
import com.cruise.service.CreateNotificationPreferenceRequest
import com.cruise.service.CreateNotificationSubscriptionRequest
import com.cruise.service.NotificationDto
import com.cruise.service.NotificationPreferenceDto
import com.cruise.service.NotificationPreferenceQuery
import com.cruise.service.NotificationQuery
import com.cruise.service.NotificationService
import com.cruise.service.NotificationSubscriptionDto
import com.cruise.service.NotificationSubscriptionQuery
import com.cruise.service.UpdateNotificationRequest
import com.cruise.service.UpdateNotificationPreferenceRequest
import com.cruise.service.UpdateNotificationSubscriptionRequest
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
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) resourceType: String?,
        @RequestParam(required = false) resourceId: Long?,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<NotificationDto> = notificationService.findAll(
        NotificationQuery(
            userId = userId,
            unreadOnly = unreadOnly,
            type = type,
            category = category,
            resourceType = resourceType,
            resourceId = resourceId,
            includeArchived = includeArchived
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

    @GetMapping("/subscriptions")
    fun getSubscriptions(
        @RequestParam(required = false) userId: Long?,
        @RequestParam(required = false) resourceType: String?,
        @RequestParam(required = false) resourceId: Long?,
        @RequestParam(required = false) active: Boolean?,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<NotificationSubscriptionDto> = notificationService.findSubscriptions(
        NotificationSubscriptionQuery(
            userId = userId,
            resourceType = resourceType,
            resourceId = resourceId,
            active = active,
            includeArchived = includeArchived
        )
    )

    @GetMapping("/subscriptions/{id}")
    fun getSubscription(@PathVariable id: Long): NotificationSubscriptionDto =
        notificationService.findSubscriptionById(id)

    @PostMapping("/subscriptions")
    fun createSubscription(@RequestBody request: CreateNotificationSubscriptionRequest): ResponseEntity<NotificationSubscriptionDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(notificationService.createSubscription(request))

    @PutMapping("/subscriptions/{id}")
    fun updateSubscription(
        @PathVariable id: Long,
        @RequestBody request: UpdateNotificationSubscriptionRequest
    ): NotificationSubscriptionDto = notificationService.updateSubscription(id, request)

    @DeleteMapping("/subscriptions/{id}")
    fun deleteSubscription(@PathVariable id: Long): ResponseEntity<Void> {
        notificationService.deleteSubscription(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/preferences")
    fun getPreferences(
        @RequestParam(required = false) userId: Long?,
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) channel: String?
    ): List<NotificationPreferenceDto> = notificationService.findPreferences(
        NotificationPreferenceQuery(
            userId = userId,
            category = category,
            channel = channel
        )
    )

    @GetMapping("/preferences/{id}")
    fun getPreference(@PathVariable id: Long): NotificationPreferenceDto =
        notificationService.findPreferenceById(id)

    @PostMapping("/preferences")
    fun createPreference(@RequestBody request: CreateNotificationPreferenceRequest): ResponseEntity<NotificationPreferenceDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(notificationService.createPreference(request))

    @PutMapping("/preferences/{id}")
    fun updatePreference(
        @PathVariable id: Long,
        @RequestBody request: UpdateNotificationPreferenceRequest
    ): NotificationPreferenceDto = notificationService.updatePreference(id, request)

    @DeleteMapping("/preferences/{id}")
    fun deletePreference(@PathVariable id: Long): ResponseEntity<Void> {
        notificationService.deletePreference(id)
        return ResponseEntity.noContent().build()
    }
}
