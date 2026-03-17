package com.cruise.controller

import com.cruise.service.IssueAttachmentDto
import com.cruise.service.IssueAttachmentService
import org.springframework.core.io.Resource
import org.springframework.http.ContentDisposition
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/issues/{issueId}/attachments")
class IssueAttachmentController(
    private val issueAttachmentService: IssueAttachmentService
) {
    @GetMapping
    fun getAll(@PathVariable issueId: Long): List<IssueAttachmentDto> =
        issueAttachmentService.findAll(issueId)

    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun upload(
        @PathVariable issueId: Long,
        @RequestPart("file") file: MultipartFile,
        @RequestParam(required = false) uploadedBy: Long?
    ): ResponseEntity<IssueAttachmentDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(issueAttachmentService.upload(issueId, file, uploadedBy))

    @GetMapping("/{attachmentId}/download")
    fun download(@PathVariable issueId: Long, @PathVariable attachmentId: Long): ResponseEntity<Resource> {
        val download = issueAttachmentService.load(issueId, attachmentId)
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(download.attachment.contentType ?: MediaType.APPLICATION_OCTET_STREAM_VALUE))
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.attachment().filename(download.attachment.filename).build().toString()
            )
            .body(download.resource)
    }

    @DeleteMapping("/{attachmentId}")
    fun delete(@PathVariable issueId: Long, @PathVariable attachmentId: Long): ResponseEntity<Void> {
        issueAttachmentService.delete(issueId, attachmentId)
        return ResponseEntity.noContent().build()
    }
}
