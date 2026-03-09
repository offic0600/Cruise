package com.cruise.controller

import com.cruise.service.AiQueryRequest
import com.cruise.service.AiQueryResponse
import com.cruise.service.AiQueryService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/ai")
class AiQueryController(
    private val aiQueryService: AiQueryService
) {
    @PostMapping("/query")
    fun query(@RequestBody request: AiQueryRequest): AiQueryResponse =
        aiQueryService.processQuery(request.query)
}
