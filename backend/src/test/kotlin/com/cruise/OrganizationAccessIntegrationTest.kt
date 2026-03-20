package com.cruise

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
class OrganizationAccessIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `membershipless user can list organizations and receives empty array`() {
        val token = loginAndGetToken("admin", "admin123")

        mockMvc.perform(
            get("/api/organizations")
                .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
    }

    @Test
    fun `membershipless user can create workspace`() {
        val token = loginAndGetToken("admin", "admin123")
        val slug = "test-${UUID.randomUUID().toString().take(8)}"

        mockMvc.perform(
            post("/api/organizations")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Test Workspace",
                      "slug": "$slug",
                      "region": "Asia Pacific"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.organization.slug").value(slug))
            .andExpect(jsonPath("$.initialTeam.name").value("Test Workspace"))
    }

    @Test
    fun `issue list q matches identifier`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspaceSlug = "test-${UUID.randomUUID().toString().take(8)}"

        val workspaceResponse = mockMvc.perform(
            post("/api/organizations")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Issue Search Workspace",
                      "slug": "$workspaceSlug",
                      "region": "Asia Pacific"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val workspacePayload = objectMapper.readTree(workspaceResponse)
        val organizationId = workspacePayload["organization"]["id"].asLong()
        val teamId = workspacePayload["initialTeam"]["id"].asLong()

        val createdIssueResponse = mockMvc.perform(
            post("/api/issues")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "teamId": $teamId,
                      "type": "TASK",
                      "title": "Identifier lookup issue"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val createdIssuePayload = objectMapper.readTree(createdIssueResponse)
        val identifier = createdIssuePayload["identifier"].asText()

        mockMvc.perform(
            get("/api/issues")
                .header("Authorization", "Bearer $token")
                .param("organizationId", organizationId.toString())
                .param("teamId", teamId.toString())
                .param("q", identifier)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.items[0].identifier").value(identifier))
    }

    private fun loginAndGetToken(username: String, password: String): String {
        val response = mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "username": "$username",
                      "password": "$password"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isOk)
            .andReturn()
            .response
            .contentAsString

        val payload: JsonNode = objectMapper.readTree(response)
        val token = payload["token"]?.asText()
        assertThat(token).isNotBlank()
        return token!!
    }
}
