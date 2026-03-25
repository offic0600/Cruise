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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
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

    @Test
    fun `issue can be fetched directly by organization and identifier`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspaceSlug = "test-${UUID.randomUUID().toString().take(8)}"

        val workspaceResponse = mockMvc.perform(
            post("/api/organizations")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Issue Direct Lookup Workspace",
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
                      "title": "Direct identifier issue"
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
        val issueId = createdIssuePayload["id"].asLong()

        mockMvc.perform(
            get("/api/issues/by-identifier")
                .header("Authorization", "Bearer $token")
                .param("organizationId", organizationId.toString())
                .param("identifier", identifier)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(issueId))
            .andExpect(jsonPath("$.identifier").value(identifier))
    }

    @Test
    fun `issue update treats parentIssueId zero as no parent`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspaceSlug = "test-${UUID.randomUUID().toString().take(8)}"

        val workspaceResponse = mockMvc.perform(
            post("/api/organizations")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Issue Update Workspace",
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
                      "title": "Parent normalization issue"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val createdIssuePayload = objectMapper.readTree(createdIssueResponse)
        val issueId = createdIssuePayload["id"].asLong()

        mockMvc.perform(
            put("/api/issues/$issueId")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "title": "Updated without parent",
                      "teamId": $teamId,
                      "parentIssueId": 0
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.title").value("Updated without parent"))
            .andExpect(jsonPath("$.parentIssueId").doesNotExist())
    }

    @Test
    fun `issue body content json is stored with revision and description export`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspaceSlug = "test-${UUID.randomUUID().toString().take(8)}"

        val workspaceResponse = mockMvc.perform(
            post("/api/organizations")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Issue Content Workspace",
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
                      "title": "Content backed issue",
                      "description": "Legacy body"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val issueId = objectMapper.readTree(createdIssueResponse)["id"].asLong()

        mockMvc.perform(
            put("/api/issues/$issueId")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "expectedRevision": 0,
                      "descriptionExport": "# Migrated body",
                      "contentJson": {
                        "type": "doc",
                        "content": [
                          {
                            "type": "heading",
                            "attrs": { "level": 1 },
                            "content": [
                              { "type": "text", "text": "Migrated body" }
                            ]
                          }
                        ]
                      }
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.description").value("# Migrated body"))
            .andExpect(jsonPath("$.contentFormat").value("PROSEMIRROR_JSON"))
            .andExpect(jsonPath("$.contentRevision").value(1))
            .andExpect(jsonPath("$.contentJson.type").value("doc"))
            .andExpect(jsonPath("$.contentJson.content[0].type").value("heading"))
    }

    @Test
    fun `issue body content revision conflicts return conflict`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspaceSlug = "test-${UUID.randomUUID().toString().take(8)}"

        val workspaceResponse = mockMvc.perform(
            post("/api/organizations")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Issue Revision Workspace",
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
                      "title": "Revision checked issue"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val issueId = objectMapper.readTree(createdIssueResponse)["id"].asLong()

        mockMvc.perform(
            put("/api/issues/$issueId")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "expectedRevision": 0,
                      "descriptionExport": "First save",
                      "contentJson": {
                        "type": "doc",
                        "content": [
                          {
                            "type": "paragraph",
                            "content": [
                              { "type": "text", "text": "First save" }
                            ]
                          }
                        ]
                      }
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contentRevision").value(1))

        mockMvc.perform(
            put("/api/issues/$issueId")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "expectedRevision": 0,
                      "descriptionExport": "Stale save",
                      "contentJson": {
                        "type": "doc",
                        "content": [
                          {
                            "type": "paragraph",
                            "content": [
                              { "type": "text", "text": "Stale save" }
                            ]
                          }
                        ]
                      }
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isConflict)
    }

    @Test
    fun `issue activity events are recorded for create and tracked field changes`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspaceSlug = "test-${UUID.randomUUID().toString().take(8)}"

        val workspaceResponse = mockMvc.perform(
            post("/api/organizations")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "Issue Activity Workspace",
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

        val projectResponse = mockMvc.perform(
            post("/api/projects")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "teamId": $teamId,
                      "name": "Activity Project"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val projectId = objectMapper.readTree(projectResponse)["id"].asLong()

        val labelResponse = mockMvc.perform(
            post("/api/labels")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "scopeType": "TEAM",
                      "scopeId": $teamId,
                      "name": "Bug",
                      "createdBy": 1
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val labelId = objectMapper.readTree(labelResponse)["id"].asLong()

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
                      "title": "Activity tracked issue"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val issueId = objectMapper.readTree(createdIssueResponse)["id"].asLong()

        mockMvc.perform(
            put("/api/issues/$issueId")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "assigneeId": 1,
                      "priority": "HIGH",
                      "projectId": $projectId,
                      "labelIds": [$labelId]
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isOk)

        mockMvc.perform(
            put("/api/issues/$issueId")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "state": "IN_PROGRESS"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isOk)

        val activityPayload = mockMvc.perform(
            get("/api/activity")
                .header("Authorization", "Bearer $token")
                .param("entityType", "ISSUE")
                .param("entityId", issueId.toString())
        )
            .andExpect(status().isOk)
            .andReturn()
            .response
            .contentAsString

        val events = objectMapper.readTree(activityPayload)
        val eventTypes = events.map { it["eventType"].asText() }
        val actorIds = events.map { it["actorId"]?.asLong() }
        val stateChanged = events.first { it["eventType"].asText() == "ISSUE_STATE_CHANGED" }
        val assigneeChanged = events.first { it["eventType"].asText() == "ISSUE_ASSIGNEE_CHANGED" }
        val priorityChanged = events.first { it["eventType"].asText() == "ISSUE_PRIORITY_CHANGED" }
        val projectChanged = events.first { it["eventType"].asText() == "ISSUE_PROJECT_CHANGED" }
        val labelsChanged = events.first { it["eventType"].asText() == "ISSUE_LABELS_CHANGED" }

        assertThat(eventTypes).contains("ISSUE_CREATED")
        assertThat(eventTypes).contains("ISSUE_ASSIGNEE_CHANGED")
        assertThat(eventTypes).contains("ISSUE_PRIORITY_CHANGED")
        assertThat(eventTypes).contains("ISSUE_PROJECT_CHANGED")
        assertThat(eventTypes).contains("ISSUE_LABELS_CHANGED")
        assertThat(eventTypes).contains("ISSUE_STATE_CHANGED")
        assertThat(stateChanged["payload"]["from"].asText()).isEqualTo("TODO")
        assertThat(stateChanged["payload"]["to"].asText()).isEqualTo("IN_PROGRESS")
        assertThat(assigneeChanged["payload"]["fromName"].asText()).isEqualTo("Unassigned")
        assertThat(assigneeChanged["payload"]["toName"].asText()).isEqualTo("Cruise Admin")
        assertThat(priorityChanged["payload"]["from"].asText()).isEqualTo("MEDIUM")
        assertThat(priorityChanged["payload"]["to"].asText()).isEqualTo("HIGH")
        assertThat(projectChanged["payload"]["fromName"].asText()).isEqualTo("No project")
        assertThat(projectChanged["payload"]["toName"].asText()).isEqualTo("Activity Project")
        assertThat(labelsChanged["payload"]["from"].isArray).isTrue()
        assertThat(labelsChanged["payload"]["to"][0]["name"].asText()).isEqualTo("Bug")
        assertThat(actorIds).allMatch { it == 1L }
    }

    @Test
    fun `system issue views are initialized and active results are server filtered`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspacePayload = createWorkspace(token, "views-${UUID.randomUUID().toString().take(8)}", "Views Workspace")
        val organizationId = workspacePayload["organization"]["id"].asLong()
        val teamId = workspacePayload["initialTeam"]["id"].asLong()

        mockMvc.perform(
            post("/api/issues")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "teamId": $teamId,
                      "type": "TASK",
                      "title": "Visible active issue",
                      "state": "TODO"
                    }
                    """.trimIndent()
                )
        ).andExpect(status().isCreated)

        mockMvc.perform(
            post("/api/issues")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "teamId": $teamId,
                      "type": "TASK",
                      "title": "Hidden completed issue",
                      "state": "DONE"
                    }
                    """.trimIndent()
                )
        ).andExpect(status().isCreated)

        val viewsPayload = mockMvc.perform(
            get("/api/views")
                .header("Authorization", "Bearer $token")
                .param("organizationId", organizationId.toString())
                .param("resourceType", "ISSUE")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.systemKey=='active')]").exists())
            .andExpect(jsonPath("$[?(@.systemKey=='all')]").exists())
            .andReturn()
            .response
            .contentAsString

        val activeViewId = objectMapper.readTree(viewsPayload)
            .first { it["systemKey"]?.asText() == "active" }["id"].asLong()

        mockMvc.perform(
            post("/api/views/$activeViewId/results")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{ "page": 0, "size": 50 }""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.totalCount").value(1))
            .andExpect(jsonPath("$.items[0].title").value("Visible active issue"))
    }

    @Test
    fun `custom views can be created favorited duplicated and deleted while system views cannot`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspacePayload = createWorkspace(token, "views-${UUID.randomUUID().toString().take(8)}", "Views Lifecycle Workspace")
        val organizationId = workspacePayload["organization"]["id"].asLong()
        val teamId = workspacePayload["initialTeam"]["id"].asLong()

        val createdViewPayload = mockMvc.perform(
            post("/api/views")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "resourceType": "ISSUE",
                      "scopeType": "TEAM",
                      "scopeId": $teamId,
                      "name": "My critical work",
                      "visibility": "PERSONAL",
                      "queryState": {
                        "filters": {
                          "operator": "AND",
                          "children": [
                            {
                              "field": "priority",
                              "operator": "is",
                              "value": "HIGH"
                            }
                          ]
                        },
                        "display": {
                          "layout": "LIST",
                          "visibleColumns": ["identifier", "title", "priority", "state"]
                        },
                        "grouping": { "field": null },
                        "sorting": [{ "field": "updatedAt", "direction": "desc", "nulls": "last" }]
                      }
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.resourceType").value("ISSUE"))
            .andExpect(jsonPath("$.scopeType").value("TEAM"))
            .andExpect(jsonPath("$.isFavorite").value(false))
            .andReturn()
            .response
            .contentAsString

        val createdViewId = objectMapper.readTree(createdViewPayload)["id"].asLong()

        mockMvc.perform(
            post("/api/views/$createdViewId/favorite")
                .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.isFavorite").value(true))

        val duplicatedPayload = mockMvc.perform(
            post("/api/views/$createdViewId/duplicate")
                .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("My critical work Copy"))
            .andReturn()
            .response
            .contentAsString

        val duplicatedViewId = objectMapper.readTree(duplicatedPayload)["id"].asLong()

        mockMvc.perform(
            delete("/api/views/$createdViewId")
                .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isNoContent)

        val systemViewsPayload = mockMvc.perform(
            get("/api/views")
                .header("Authorization", "Bearer $token")
                .param("organizationId", organizationId.toString())
                .param("resourceType", "ISSUE")
        )
            .andExpect(status().isOk)
            .andReturn()
            .response
            .contentAsString

        val systemViewId = objectMapper.readTree(systemViewsPayload)
            .first { it["systemKey"]?.asText() == "all" }["id"].asLong()

        mockMvc.perform(
            delete("/api/views/$systemViewId")
                .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isConflict)

        mockMvc.perform(
            get("/api/views/$duplicatedViewId")
                .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("My critical work Copy"))
    }

    @Test
    fun `view visibility must match scope type`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspacePayload = createWorkspace(token, "views-${UUID.randomUUID().toString().take(8)}", "Views Scope Workspace")
        val organizationId = workspacePayload["organization"]["id"].asLong()
        val teamId = workspacePayload["initialTeam"]["id"].asLong()

        mockMvc.perform(
            post("/api/views")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "resourceType": "ISSUE",
                      "scopeType": "WORKSPACE",
                      "name": "Invalid workspace visibility",
                      "visibility": "TEAM",
                      "queryState": {
                        "filters": { "operator": "AND", "children": [] },
                        "display": { "layout": "LIST", "visibleColumns": ["identifier", "title"] },
                        "grouping": { "field": null },
                        "sorting": [{ "field": "updatedAt", "direction": "desc", "nulls": "last" }]
                      }
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isBadRequest)

        mockMvc.perform(
            post("/api/views")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "resourceType": "ISSUE",
                      "scopeType": "TEAM",
                      "scopeId": $teamId,
                      "name": "Team shared view",
                      "visibility": "TEAM",
                      "queryState": {
                        "filters": { "operator": "AND", "children": [] },
                        "display": { "layout": "LIST", "visibleColumns": ["identifier", "title"] },
                        "grouping": { "field": null },
                        "sorting": [{ "field": "updatedAt", "direction": "desc", "nulls": "last" }]
                      }
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.visibility").value("TEAM"))
    }

    private fun createWorkspace(token: String, slug: String, name: String): JsonNode {
        val workspaceResponse = mockMvc.perform(
            post("/api/organizations")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "name": "$name",
                      "slug": "$slug",
                      "region": "Asia Pacific"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        return objectMapper.readTree(workspaceResponse)
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
