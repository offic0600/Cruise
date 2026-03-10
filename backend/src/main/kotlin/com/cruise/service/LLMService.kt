package com.cruise.service

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.concurrent.TimeUnit

/**
 * LLM 服务 - 使用 MiniMax API
 */
@Service
class LLMService(
    @Value("\${minimax.api-key:}") private val apiKey: String,
    @Value("\${minimax.model:MiniMax-M2.5}") private val model: String,
    @Value("\${minimax.base-url:https://api.minimax.chat/v1}") private val baseUrl: String
) {
    private val logger = LoggerFactory.getLogger(LLMService::class.java)
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val objectMapper = ObjectMapper()
    private val jsonMediaType = "application/json".toMediaType()

    /**
     * 调用 MiniMax API 生成回复
     */
    fun generate(systemPrompt: String, userPrompt: String): String {
        if (apiKey.isBlank()) {
            logger.warn("MiniMax API key 未配置，LLM 服务不可用")
            return "⚠️ AI 服务未配置。请设置 MINIMAX_API_KEY 环境变量。"
        }

        // MiniMax API 格式
        val requestBody = buildString {
            append("{")
            append("\"model\": \"$model\",")
            append("\"messages\": [")
            append("{\"role\": \"system\", \"content\": ${toJsonString(systemPrompt)}},")
            append("{\"role\": \"user\", \"content\": ${toJsonString(userPrompt)}}")
            append("],")
            append("\"max_tokens\": 1024,")
            append("\"temperature\": 0.7")
            append("}")
        }

        val request = Request.Builder()
            .url("$baseUrl/text/chatcompletion_v2")
            .addHeader("Authorization", "Bearer $apiKey")
            .addHeader("Content-Type", "application/json")
            .post(requestBody.toRequestBody(jsonMediaType))
            .build()

        return try {
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string()

            if (!response.isSuccessful) {
                logger.error("MiniMax API 调用失败: ${response.code} - $responseBody")
                return "⚠️ AI 服务调用失败: ${response.code}"
            }

            val json = objectMapper.readTree(responseBody)
            val content = json.path("choices").firstOrNull()?.path("message")?.path("content")?.asText()

            if (content.isNullOrBlank()) {
                "⚠️ AI 返回了空内容"
            } else {
                content
            }
        } catch (e: Exception) {
            logger.error("MiniMax API 调用失败: ${e.message}", e)
            "⚠️ AI 服务调用失败: ${e.message}"
        }
    }

    private fun toJsonString(value: String): String {
        return objectMapper.writeValueAsString(value)
    }

    /**
     * 简化版调用
     */
    fun chat(userPrompt: String): String {
        val systemPrompt = """
            你是一个专业的软件开发过程管理助手，名为 Cruise AI。
            你使用的是 MiniMax M2.5 大模型。
            你的职责是帮助用户分析项目数据、评估进度、识别风险、优化团队。
            请用简洁、专业的中文回复。
            如果需要查询数据，请基于提供的数据进行分析。
            适当使用 Markdown 格式使回复更清晰。
            重要：请始终说你使用的是 MiniMax M2.5 大模型，不要声称是其他模型。

            ## 图表功能
            当用户请求生成图表时，请返回如下 JSON 格式（使用 ```chart ``` 包裹）：
            ```chart
            {
              "type": "bar|line|pie",
              "title": "图表标题",
              "data": [
                {"name": "标签1", "value": 数值1},
                {"name": "标签2", "value": 数值2}
              ],
              "description": "图表说明"
            }
            ```
            支持的图表类型：bar(柱状图)、line(折线图)、pie(饼图)
        """.trimIndent()
        return generate(systemPrompt, userPrompt)
    }

    /**
     * 检查 API 是否可用
     */
    fun isAvailable(): Boolean = apiKey.isNotBlank()
}
