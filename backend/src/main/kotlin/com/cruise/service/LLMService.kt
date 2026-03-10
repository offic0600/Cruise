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
 * LLM 服务 - 使用 Claude API
 * 使用 OkHttp 直接调用 REST API
 */
@Service
class LLMService(
    @Value("\${claude.api-key:}") private val apiKey: String,
    @Value("\${claude-model:claude-3-haiku-20240307}") private val model: String,
    @Value("\${claude-max-tokens:1024}") private val maxTokens: Int
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
     * 调用 Claude API 生成回复
     * @param systemPrompt 系统提示词
     * @param userPrompt 用户输入
     * @return AI 回复内容
     */
    fun generate(systemPrompt: String, userPrompt: String): String {
        if (apiKey.isBlank()) {
            logger.warn("Claude API key 未配置，LLM 服务不可用")
            return "⚠️ AI 服务未配置。请设置 CLAUDE_API_KEY 环境变量。"
        }

        val requestBody = buildString {
            append("{")
            append("\"model\": \"$model\",")
            append("\"max_tokens\": $maxTokens,")
            append("\"system\": ${toJsonString(systemPrompt)},")
            append("\"messages\": [")
            append("{\"role\": \"user\", \"content\": ${toJsonString(userPrompt)}}")
            append("]")
            append("}")
        }

        val request = Request.Builder()
            .url("https://api.anthropic.com/v1/messages")
            .addHeader("x-api-key", apiKey)
            .addHeader("anthropic-version", "2023-06-01")
            .post(requestBody.toRequestBody(jsonMediaType))
            .build()

        return try {
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string()

            if (!response.isSuccessful) {
                logger.error("Claude API 调用失败: ${response.code} - $responseBody")
                return "⚠️ AI 服务调用失败: ${response.code}"
            }

            val json = objectMapper.readTree(responseBody)
            val content = json.path("content").firstOrNull()?.path("text")?.asText()

            if (content.isNullOrBlank()) {
                "⚠️ AI 返回了空内容"
            } else {
                content
            }
        } catch (e: Exception) {
            logger.error("Claude API 调用失败: ${e.message}", e)
            "⚠️ AI 服务调用失败: ${e.message}"
        }
    }

    private fun toJsonString(value: String): String {
        return objectMapper.writeValueAsString(value)
    }

    /**
     * 简化版调用，只传入用户消息
     */
    fun chat(userPrompt: String): String {
        val systemPrompt = """
            你是一个专业的软件开发过程管理助手。
            你的职责是帮助用户分析项目数据、评估进度、识别风险、优化团队。
            请用简洁，专业的中文回复。
            如果需要查询数据，请基于提供的数据进行分析。
            适当使用 Markdown 格式使回复更清晰。
        """.trimIndent()
        return generate(systemPrompt, userPrompt)
    }

    /**
     * 检查 API 是否可用
     */
    fun isAvailable(): Boolean = apiKey.isNotBlank()
}
