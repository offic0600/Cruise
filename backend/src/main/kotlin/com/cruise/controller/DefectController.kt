package com.cruise.controller

import com.cruise.entity.Defect
import com.cruise.service.CreateDefectRequest
import com.cruise.service.DefectService
import com.cruise.service.UpdateDefectRequest
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/defects")
class DefectController(
    private val defectService: DefectService
) {
    @GetMapping
    fun getAll(): List<Defect> = defectService.getAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): Defect = defectService.getById(id)

    @GetMapping("/project/{projectId}")
    fun getByProjectId(@PathVariable projectId: Long): List<Defect> =
        defectService.getByProjectId(projectId)

    @GetMapping("/task/{taskId}")
    fun getByTaskId(@PathVariable taskId: Long): List<Defect> =
        defectService.getByTaskId(taskId)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody request: CreateDefectRequest): Defect =
        defectService.create(request)

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateDefectRequest): Defect =
        defectService.update(id, request)

    @PatchMapping("/{id}/status")
    fun updateStatus(@PathVariable id: Long, @RequestBody request: Map<String, String>): Defect {
        val status = request["status"] ?: throw IllegalArgumentException("Status is required")
        return defectService.updateStatus(id, status)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) = defectService.delete(id)
}
