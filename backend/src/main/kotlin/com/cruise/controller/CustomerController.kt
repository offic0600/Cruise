package com.cruise.controller

import com.cruise.service.*
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/customers")
class CustomerController(
    private val customerService: CustomerService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) statusId: Long?,
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean,
        @RequestParam(required = false, defaultValue = "0") page: Int,
        @RequestParam(required = false, defaultValue = "50") size: Int
    ): RestPageResponse<CustomerDto> = customerService.findAll(
        CustomerQuery(
            organizationId = organizationId,
            statusId = statusId,
            q = q,
            includeArchived = includeArchived,
            page = page,
            size = size
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): CustomerDto = customerService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateCustomerRequest): ResponseEntity<CustomerDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(customerService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateCustomerRequest): CustomerDto =
        customerService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        customerService.delete(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/needs")
    fun getNeeds(
        @PathVariable id: Long,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<CustomerNeedDto> = customerService.findNeeds(id, includeArchived)

    @PostMapping("/{id}/needs")
    fun createNeed(
        @PathVariable id: Long,
        @RequestBody request: CreateCustomerNeedRequest
    ): ResponseEntity<CustomerNeedDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(customerService.createNeed(id, request))

    @PutMapping("/{id}/needs/{needId}")
    fun updateNeed(
        @PathVariable id: Long,
        @PathVariable needId: Long,
        @RequestBody request: UpdateCustomerNeedRequest
    ): CustomerNeedDto = customerService.updateNeed(id, needId, request)

    @DeleteMapping("/{id}/needs/{needId}")
    fun deleteNeed(@PathVariable id: Long, @PathVariable needId: Long): ResponseEntity<Void> {
        customerService.deleteNeed(id, needId)
        return ResponseEntity.noContent().build()
    }
}
