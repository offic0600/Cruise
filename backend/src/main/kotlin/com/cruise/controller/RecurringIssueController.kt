package com.cruise.controller

import com.cruise.service.RecurringIssueDto
import com.cruise.service.RecurringIssueService
import com.cruise.service.SaveRecurringIssueRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/recurring-issues")
class RecurringIssueController(
    private val recurringIssueService: RecurringIssueService
) {
    @GetMapping
    fun getAll(): List<RecurringIssueDto> = recurringIssueService.findAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): RecurringIssueDto = recurringIssueService.findById(id)

    @PostMapping
    fun create(@RequestBody request: SaveRecurringIssueRequest): ResponseEntity<RecurringIssueDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(recurringIssueService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: SaveRecurringIssueRequest): RecurringIssueDto =
        recurringIssueService.update(id, request)

    @PostMapping("/{id}/trigger")
    fun trigger(@PathVariable id: Long) = recurringIssueService.trigger(id)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        recurringIssueService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
