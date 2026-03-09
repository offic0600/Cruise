package com.cruise.service

import com.cruise.entity.Defect
import com.cruise.repository.DefectRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class DefectService(
    private val defectRepository: DefectRepository
) {
    fun create(data: CreateDefectRequest): Defect {
        val defect = Defect(
            title = data.title,
            description = data.description,
            severity = data.severity ?: "MEDIUM",
            status = "OPEN",
            projectId = data.projectId,
            taskId = data.taskId,
            reporterId = data.reporterId
        )
        return defectRepository.save(defect)
    }

    fun getAll(): List<Defect> = defectRepository.findAll()

    fun getById(id: Long): Defect = defectRepository.findById(id)
        .orElseThrow { IllegalArgumentException("Defect not found: $id") }

    fun getByProjectId(projectId: Long): List<Defect> =
        defectRepository.findByProjectId(projectId)

    fun getByTaskId(taskId: Long): List<Defect> =
        defectRepository.findByTaskId(taskId)

    fun update(id: Long, data: UpdateDefectRequest): Defect {
        val defect = getById(id)
        val updated = Defect(
            id = defect.id,
            title = data.title ?: defect.title,
            description = data.description ?: defect.description,
            severity = data.severity ?: defect.severity,
            status = data.status ?: defect.status,
            projectId = defect.projectId,
            taskId = defect.taskId,
            reporterId = defect.reporterId,
            createdAt = defect.createdAt,
            updatedAt = LocalDateTime.now()
        )
        return defectRepository.save(updated)
    }

    fun updateStatus(id: Long, status: String): Defect {
        val defect = getById(id)
        val updated = Defect(
            id = defect.id,
            title = defect.title,
            description = defect.description,
            severity = defect.severity,
            status = status,
            projectId = defect.projectId,
            taskId = defect.taskId,
            reporterId = defect.reporterId,
            createdAt = defect.createdAt,
            updatedAt = LocalDateTime.now()
        )
        return defectRepository.save(updated)
    }

    fun delete(id: Long) {
        defectRepository.deleteById(id)
    }
}

data class CreateDefectRequest(
    val title: String,
    val description: String? = null,
    val severity: String? = null,
    val projectId: Long,
    val taskId: Long? = null,
    val reporterId: Long? = null
)

data class UpdateDefectRequest(
    val title: String? = null,
    val description: String? = null,
    val severity: String? = null,
    val status: String? = null
)
