package com.cruise.controller

import com.cruise.service.EmailIntakeConfigDto
import com.cruise.service.EmailIntakeMessageDto
import com.cruise.service.EmailIntakeService
import com.cruise.service.IngestEmailMessageRequest
import com.cruise.service.SaveEmailIntakeConfigRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/email-intake")
class EmailIntakeController(
    private val emailIntakeService: EmailIntakeService
) {
    @GetMapping("/configs")
    fun getConfigs(): List<EmailIntakeConfigDto> = emailIntakeService.getConfigs()

    @PostMapping("/configs")
    fun createConfig(@RequestBody request: SaveEmailIntakeConfigRequest): ResponseEntity<EmailIntakeConfigDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(emailIntakeService.createConfig(request))

    @PutMapping("/configs/{id}")
    fun updateConfig(@PathVariable id: Long, @RequestBody request: SaveEmailIntakeConfigRequest): EmailIntakeConfigDto =
        emailIntakeService.updateConfig(id, request)

    @DeleteMapping("/configs/{id}")
    fun deleteConfig(@PathVariable id: Long): ResponseEntity<Void> {
        emailIntakeService.deleteConfig(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/messages/ingest")
    fun ingest(@RequestBody request: IngestEmailMessageRequest): ResponseEntity<EmailIntakeMessageDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(emailIntakeService.ingest(request))
}
