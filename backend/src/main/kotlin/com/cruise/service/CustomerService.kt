package com.cruise.service

import com.cruise.entity.Customer
import com.cruise.entity.CustomerNeed
import com.cruise.repository.CustomerNeedRepository
import com.cruise.repository.CustomerRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class CustomerDto(
    val id: Long,
    val organizationId: Long,
    val name: String,
    val slugId: String?,
    val ownerId: Long?,
    val statusId: Long?,
    val tierId: Long?,
    val integrationId: Long?,
    val domains: String?,
    val externalIds: String?,
    val logoUrl: String?,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class CustomerNeedDto(
    val id: Long,
    val customerId: Long,
    val projectId: Long?,
    val title: String,
    val description: String?,
    val priority: String,
    val status: String,
    val createdAt: String,
    val updatedAt: String,
    val archivedAt: String?
)

data class CustomerQuery(
    val organizationId: Long? = null,
    val statusId: Long? = null,
    val q: String? = null,
    val includeArchived: Boolean = false,
    val page: Int = 0,
    val size: Int = 50
)

data class CreateCustomerRequest(
    val organizationId: Long? = null,
    val name: String,
    val slugId: String? = null,
    val ownerId: Long? = null,
    val statusId: Long? = null,
    val tierId: Long? = null,
    val integrationId: Long? = null,
    val domains: String? = null,
    val externalIds: String? = null,
    val logoUrl: String? = null
)

data class UpdateCustomerRequest(
    val name: String? = null,
    val slugId: String? = null,
    val ownerId: Long? = null,
    val statusId: Long? = null,
    val tierId: Long? = null,
    val integrationId: Long? = null,
    val domains: String? = null,
    val externalIds: String? = null,
    val logoUrl: String? = null,
    val archivedAt: String? = null
)

data class CreateCustomerNeedRequest(
    val projectId: Long? = null,
    val title: String,
    val description: String? = null,
    val priority: String? = null,
    val status: String? = null
)

data class UpdateCustomerNeedRequest(
    val projectId: Long? = null,
    val title: String? = null,
    val description: String? = null,
    val priority: String? = null,
    val status: String? = null,
    val archivedAt: String? = null
)

@Service
class CustomerService(
    private val customerRepository: CustomerRepository,
    private val customerNeedRepository: CustomerNeedRepository
) {
    fun findAll(query: CustomerQuery = CustomerQuery()): RestPageResponse<CustomerDto> =
        customerRepository.findAll()
            .asSequence()
            .filter { query.organizationId == null || it.organizationId == query.organizationId }
            .filter { query.statusId == null || it.statusId == query.statusId }
            .filter { query.includeArchived || it.archivedAt == null }
            .filter {
                query.q.isNullOrBlank() || listOfNotNull(it.name, it.slugId, it.domains)
                    .any { value -> value.contains(query.q, ignoreCase = true) }
            }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()
            .toRestPage(query.page, query.size)

    fun findById(id: Long): CustomerDto = getCustomer(id).toDto()

    fun create(request: CreateCustomerRequest): CustomerDto =
        customerRepository.save(
            Customer(
                organizationId = request.organizationId ?: 1L,
                name = request.name,
                slugId = request.slugId,
                ownerId = request.ownerId,
                statusId = request.statusId,
                tierId = request.tierId,
                integrationId = request.integrationId,
                domains = request.domains,
                externalIds = request.externalIds,
                logoUrl = request.logoUrl
            )
        ).toDto()

    fun update(id: Long, request: UpdateCustomerRequest): CustomerDto {
        val current = getCustomer(id)
        return customerRepository.save(
            Customer(
                id = current.id,
                organizationId = current.organizationId,
                name = request.name ?: current.name,
                slugId = request.slugId ?: current.slugId,
                ownerId = request.ownerId ?: current.ownerId,
                statusId = request.statusId ?: current.statusId,
                tierId = request.tierId ?: current.tierId,
                integrationId = request.integrationId ?: current.integrationId,
                domains = request.domains ?: current.domains,
                externalIds = request.externalIds ?: current.externalIds,
                logoUrl = request.logoUrl ?: current.logoUrl,
                createdAt = current.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: current.archivedAt
            )
        ).toDto()
    }

    fun delete(id: Long) {
        customerRepository.delete(getCustomer(id))
    }

    fun findNeeds(customerId: Long, includeArchived: Boolean = false): List<CustomerNeedDto> =
        customerNeedRepository.findAll()
            .asSequence()
            .filter { it.customerId == customerId }
            .filter { includeArchived || it.archivedAt == null }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun createNeed(customerId: Long, request: CreateCustomerNeedRequest): CustomerNeedDto {
        getCustomer(customerId)
        return customerNeedRepository.save(
            CustomerNeed(
                customerId = customerId,
                projectId = request.projectId,
                title = request.title,
                description = request.description,
                priority = request.priority ?: "medium",
                status = request.status ?: "open"
            )
        ).toDto()
    }

    fun updateNeed(customerId: Long, needId: Long, request: UpdateCustomerNeedRequest): CustomerNeedDto {
        getCustomer(customerId)
        val current = getNeed(needId)
        if (current.customerId != customerId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer need does not belong to customer")
        }
        return customerNeedRepository.save(
            CustomerNeed(
                id = current.id,
                customerId = current.customerId,
                projectId = request.projectId ?: current.projectId,
                title = request.title ?: current.title,
                description = request.description ?: current.description,
                priority = request.priority ?: current.priority,
                status = request.status ?: current.status,
                createdAt = current.createdAt,
                updatedAt = LocalDateTime.now(),
                archivedAt = parseDateTime(request.archivedAt) ?: current.archivedAt
            )
        ).toDto()
    }

    fun deleteNeed(customerId: Long, needId: Long) {
        getCustomer(customerId)
        val need = getNeed(needId)
        if (need.customerId != customerId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer need does not belong to customer")
        }
        customerNeedRepository.delete(need)
    }

    private fun getCustomer(id: Long): Customer = customerRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found") }

    private fun getNeed(id: Long): CustomerNeed = customerNeedRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Customer need not found") }

    private fun Customer.toDto() = CustomerDto(
        id = id,
        organizationId = organizationId,
        name = name,
        slugId = slugId,
        ownerId = ownerId,
        statusId = statusId,
        tierId = tierId,
        integrationId = integrationId,
        domains = domains,
        externalIds = externalIds,
        logoUrl = logoUrl,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun CustomerNeed.toDto() = CustomerNeedDto(
        id = id,
        customerId = customerId,
        projectId = projectId,
        title = title,
        description = description,
        priority = priority,
        status = status,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        archivedAt = archivedAt?.toString()
    )

    private fun parseDateTime(value: String?): LocalDateTime? = value?.let(LocalDateTime::parse)
}
