package com.cruise.controller

import com.cruise.service.*
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class ResourceCatalogController(
    private val resourceCatalogService: ResourceCatalogService
) {
    @GetMapping("/cycles")
    fun getCycles(@RequestParam(required = false) organizationId: Long?, @RequestParam(required = false) teamId: Long?, @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean) =
        resourceCatalogService.listCycles(organizationId, teamId, includeArchived)

    @PostMapping("/cycles")
    fun createCycle(@RequestBody request: CreateCycleRequest): ResponseEntity<CycleDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(resourceCatalogService.createCycle(request))

    @PutMapping("/cycles/{id}")
    fun updateCycle(@PathVariable id: Long, @RequestBody request: UpdateCycleRequest) =
        resourceCatalogService.updateCycle(id, request)

    @DeleteMapping("/cycles/{id}")
    fun deleteCycle(@PathVariable id: Long): ResponseEntity<Void> {
        resourceCatalogService.deleteCycle(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/project-statuses")
    fun getProjectStatuses(@RequestParam(required = false) organizationId: Long?, @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean) =
        resourceCatalogService.listProjectStatuses(organizationId, includeArchived)

    @PostMapping("/project-statuses")
    fun createProjectStatus(@RequestBody request: CreateProjectStatusRequest): ResponseEntity<ProjectStatusDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(resourceCatalogService.createProjectStatus(request))

    @PutMapping("/project-statuses/{id}")
    fun updateProjectStatus(@PathVariable id: Long, @RequestBody request: UpdateProjectStatusRequest) =
        resourceCatalogService.updateProjectStatus(id, request)

    @DeleteMapping("/project-statuses/{id}")
    fun deleteProjectStatus(@PathVariable id: Long): ResponseEntity<Void> {
        resourceCatalogService.deleteProjectStatus(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/initiatives/{initiativeId}/relations")
    fun getInitiativeRelations(@PathVariable initiativeId: Long, @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean) =
        resourceCatalogService.listInitiativeRelations(initiativeId, includeArchived)

    @PostMapping("/initiatives/{initiativeId}/relations")
    fun createInitiativeRelation(@PathVariable initiativeId: Long, @RequestBody request: CreateInitiativeRelationRequest): ResponseEntity<InitiativeRelationDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(resourceCatalogService.createInitiativeRelation(initiativeId, request))

    @PutMapping("/initiatives/{initiativeId}/relations/{id}")
    fun updateInitiativeRelation(@PathVariable initiativeId: Long, @PathVariable id: Long, @RequestBody request: UpdateInitiativeRelationRequest) =
        resourceCatalogService.updateInitiativeRelation(initiativeId, id, request)

    @DeleteMapping("/initiatives/{initiativeId}/relations/{id}")
    fun deleteInitiativeRelation(@PathVariable initiativeId: Long, @PathVariable id: Long): ResponseEntity<Void> {
        resourceCatalogService.deleteInitiativeRelation(initiativeId, id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/customer-statuses")
    fun getCustomerStatuses(@RequestParam(required = false) organizationId: Long?, @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean) =
        resourceCatalogService.listCustomerStatuses(organizationId, includeArchived)

    @PostMapping("/customer-statuses")
    fun createCustomerStatus(@RequestBody request: CreateCustomerStatusRequest): ResponseEntity<CustomerStatusDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(resourceCatalogService.createCustomerStatus(request))

    @PutMapping("/customer-statuses/{id}")
    fun updateCustomerStatus(@PathVariable id: Long, @RequestBody request: UpdateCustomerStatusRequest) =
        resourceCatalogService.updateCustomerStatus(id, request)

    @DeleteMapping("/customer-statuses/{id}")
    fun deleteCustomerStatus(@PathVariable id: Long): ResponseEntity<Void> {
        resourceCatalogService.deleteCustomerStatus(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/customer-tiers")
    fun getCustomerTiers(@RequestParam(required = false) organizationId: Long?, @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean) =
        resourceCatalogService.listCustomerTiers(organizationId, includeArchived)

    @PostMapping("/customer-tiers")
    fun createCustomerTier(@RequestBody request: CreateCustomerTierRequest): ResponseEntity<CustomerTierDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(resourceCatalogService.createCustomerTier(request))

    @PutMapping("/customer-tiers/{id}")
    fun updateCustomerTier(@PathVariable id: Long, @RequestBody request: UpdateCustomerTierRequest) =
        resourceCatalogService.updateCustomerTier(id, request)

    @DeleteMapping("/customer-tiers/{id}")
    fun deleteCustomerTier(@PathVariable id: Long): ResponseEntity<Void> {
        resourceCatalogService.deleteCustomerTier(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/external-entity-info")
    fun getExternalEntityInfo(@RequestParam(required = false) service: String?, @RequestParam(required = false) entityType: String?, @RequestParam(required = false) entityId: Long?) =
        resourceCatalogService.listExternalEntityInfo(service, entityType, entityId)

    @PostMapping("/external-entity-info")
    fun createExternalEntityInfo(@RequestBody request: CreateExternalEntityInfoRequest): ResponseEntity<ExternalEntityInfoDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(resourceCatalogService.createExternalEntityInfo(request))

    @PutMapping("/external-entity-info/{id}")
    fun updateExternalEntityInfo(@PathVariable id: Long, @RequestBody request: UpdateExternalEntityInfoRequest) =
        resourceCatalogService.updateExternalEntityInfo(id, request)

    @DeleteMapping("/external-entity-info/{id}")
    fun deleteExternalEntityInfo(@PathVariable id: Long): ResponseEntity<Void> {
        resourceCatalogService.deleteExternalEntityInfo(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/external-users")
    fun getExternalUsers(@RequestParam(required = false) service: String?) =
        resourceCatalogService.listExternalUsers(service)

    @PostMapping("/external-users")
    fun createExternalUser(@RequestBody request: CreateExternalUserRequest): ResponseEntity<ExternalUserDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(resourceCatalogService.createExternalUser(request))

    @PutMapping("/external-users/{id}")
    fun updateExternalUser(@PathVariable id: Long, @RequestBody request: UpdateExternalUserRequest) =
        resourceCatalogService.updateExternalUser(id, request)

    @DeleteMapping("/external-users/{id}")
    fun deleteExternalUser(@PathVariable id: Long): ResponseEntity<Void> {
        resourceCatalogService.deleteExternalUser(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/entity-external-links")
    fun getEntityExternalLinks(@RequestParam(required = false) entityType: String?, @RequestParam(required = false) entityId: Long?) =
        resourceCatalogService.listEntityExternalLinks(entityType, entityId)

    @PostMapping("/entity-external-links")
    fun createEntityExternalLink(@RequestBody request: CreateEntityExternalLinkRequest): ResponseEntity<EntityExternalLinkDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(resourceCatalogService.createEntityExternalLink(request))

    @PutMapping("/entity-external-links/{id}")
    fun updateEntityExternalLink(@PathVariable id: Long, @RequestBody request: UpdateEntityExternalLinkRequest) =
        resourceCatalogService.updateEntityExternalLink(id, request)

    @DeleteMapping("/entity-external-links/{id}")
    fun deleteEntityExternalLink(@PathVariable id: Long): ResponseEntity<Void> {
        resourceCatalogService.deleteEntityExternalLink(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/agent-activities")
    fun getAgentActivities(@RequestParam(required = false) agentSessionId: Long?) =
        resourceCatalogService.listAgentActivities(agentSessionId)

    @PostMapping("/agent-activities")
    fun createAgentActivity(@RequestBody request: CreateAgentActivityRequest): ResponseEntity<AgentActivityDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(resourceCatalogService.createAgentActivity(request))

    @PutMapping("/agent-activities/{id}")
    fun updateAgentActivity(@PathVariable id: Long, @RequestBody request: UpdateAgentActivityRequest) =
        resourceCatalogService.updateAgentActivity(id, request)

    @DeleteMapping("/agent-activities/{id}")
    fun deleteAgentActivity(@PathVariable id: Long): ResponseEntity<Void> {
        resourceCatalogService.deleteAgentActivity(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/reactions")
    fun getReactions(@RequestParam(required = false) issueId: Long?, @RequestParam(required = false) commentId: Long?, @RequestParam(required = false) projectUpdateId: Long?, @RequestParam(required = false) initiativeUpdateId: Long?) =
        resourceCatalogService.listReactions(issueId, commentId, projectUpdateId, initiativeUpdateId)

    @PostMapping("/reactions")
    fun createReaction(@RequestBody request: CreateReactionRequest): ResponseEntity<ReactionDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(resourceCatalogService.createReaction(request))

    @DeleteMapping("/reactions/{id}")
    fun deleteReaction(@PathVariable id: Long): ResponseEntity<Void> {
        resourceCatalogService.deleteReaction(id)
        return ResponseEntity.noContent().build()
    }
}
