package com.cruise

import com.cruise.entity.View
import com.cruise.repository.ViewRepository
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

    @Autowired
    private lateinit var viewRepository: ViewRepository

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
    fun `issue create defaults to no priority and issue query can filter no priority`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspacePayload = createWorkspace(token, "priority-${UUID.randomUUID().toString().take(8)}", "Priority Workspace")
        val organizationId = workspacePayload["organization"]["id"].asLong()
        val teamId = workspacePayload["initialTeam"]["id"].asLong()

        val firstIssue = mockMvc.perform(
            post("/api/issues")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "teamId": $teamId,
                      "type": "TASK",
                      "title": "No priority issue"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.priority").doesNotExist())
            .andReturn()
            .response
            .contentAsString

        val firstIssueId = objectMapper.readTree(firstIssue)["id"].asLong()

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
                      "title": "High priority issue",
                      "priority": "HIGH"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)

        mockMvc.perform(
            get("/api/issues")
                .header("Authorization", "Bearer $token")
                .param("organizationId", organizationId.toString())
                .param("priority", "NO_PRIORITY")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.totalCount").value(1))
            .andExpect(jsonPath("$.items[0].id").value(firstIssueId))
    }

    @Test
    fun `issue update can explicitly clear priority with null`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspacePayload = createWorkspace(token, "priority-${UUID.randomUUID().toString().take(8)}", "Priority Update Workspace")
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
                      "title": "Priority clear issue",
                      "priority": "HIGH"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.priority").value("HIGH"))
            .andReturn()
            .response
            .contentAsString

        val issueId = objectMapper.readTree(createdIssueResponse)["id"].asLong()

        mockMvc.perform(
            put("/api/issues/$issueId")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{ "priority": null }""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.priority").doesNotExist())
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
        val priorityFrom = priorityChanged["payload"].path("from")
        assertThat(priorityFrom.isMissingNode || priorityFrom.isNull).isTrue()
        assertThat(priorityChanged["payload"]["to"].asText()).isEqualTo("HIGH")
        assertThat(projectChanged["payload"]["fromName"].asText()).isEqualTo("No project")
        assertThat(projectChanged["payload"]["toName"].asText()).isEqualTo("Activity Project")
        assertThat(labelsChanged["payload"]["from"].isArray).isTrue()
        assertThat(labelsChanged["payload"]["to"][0]["name"].asText()).isEqualTo("Bug")
        assertThat(actorIds).allMatch { it == 1L }
    }

    @Test
    fun `issue views list excludes system views and custom view results are server filtered`() {
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

        val createdViewPayload = mockMvc.perform(
            post("/api/views")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "resourceType": "ISSUE",
                      "scopeType": "WORKSPACE",
                      "name": "Active issues",
                      "visibility": "PERSONAL",
                      "queryState": {
                        "filters": {
                          "operator": "AND",
                          "children": [
                            {
                              "field": "stateCategory",
                              "operator": "is",
                              "value": "ACTIVE"
                            }
                          ]
                        },
                        "display": {
                          "layout": "LIST",
                          "visibleColumns": ["identifier", "title", "state"]
                        },
                        "grouping": { "field": null },
                        "sorting": [{ "field": "updatedAt", "direction": "desc", "nulls": "last" }]
                      }
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val createdViewId = objectMapper.readTree(createdViewPayload)["id"].asLong()

        val viewsPayload = mockMvc.perform(
            get("/api/views")
                .header("Authorization", "Bearer $token")
                .param("organizationId", organizationId.toString())
                .param("resourceType", "ISSUE")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.isSystem==true)]").doesNotExist())
            .andExpect(jsonPath("$[0].id").value(createdViewId))
            .andReturn()
            .response
            .contentAsString

        assertThat(objectMapper.readTree(viewsPayload)).hasSize(1)

        mockMvc.perform(
            post("/api/views/$createdViewId/results")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{ "page": 0, "size": 50 }""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.totalCount").value(1))
            .andExpect(jsonPath("$.items[0].title").value("Visible active issue"))
    }

    @Test
    fun `custom views can be created favorited duplicated and deleted`() {
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

        mockMvc.perform(
            get("/api/views/$duplicatedViewId")
                .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("My critical work Copy"))
    }

    @Test
    fun `legacy-only view duplication and layout updates materialize normalized queryState`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspacePayload = createWorkspace(token, "views-${UUID.randomUUID().toString().take(8)}", "Legacy View Materialization Workspace")
        val organizationId = workspacePayload["organization"]["id"].asLong()

        val legacyView = viewRepository.save(
            View(
                organizationId = organizationId,
                resourceType = "PROJECT",
                scopeType = "WORKSPACE",
                ownerUserId = 1,
                name = "Legacy project view",
                filterJson = """
                    {
                      "operator": "AND",
                      "children": [
                        { "field": "status", "operator": "is", "value": "ACTIVE" }
                      ]
                    }
                """.trimIndent(),
                sortJson = """
                    [
                      { "field": "name", "direction": "desc", "nulls": "last" }
                    ]
                """.trimIndent(),
                queryState = null,
                visibility = "WORKSPACE",
                layout = "LIST"
            )
        )

        mockMvc.perform(
            put("/api/views/${legacyView.id}")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{ "layout": "BOARD" }""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.layout").value("BOARD"))
            .andExpect(jsonPath("$.queryState.display.layout").value("BOARD"))
            .andExpect(jsonPath("$.queryState.filters.children[0].field").value("status"))

        val duplicatedPayload = mockMvc.perform(
            post("/api/views/${legacyView.id}/duplicate")
                .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("Legacy project view Copy"))
            .andExpect(jsonPath("$.queryState.display.layout").value("BOARD"))
            .andExpect(jsonPath("$.queryState.filters.children[0].field").value("status"))
            .andExpect(jsonPath("$.queryState.sorting[0].field").value("name"))
            .andReturn()
            .response
            .contentAsString

        val duplicatedView = objectMapper.readTree(duplicatedPayload)
        val duplicatedViewId = duplicatedView["id"].asLong()

        mockMvc.perform(
            get("/api/views/$duplicatedViewId")
                .header("Authorization", "Bearer $token")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.queryState.display.layout").value("BOARD"))
            .andExpect(jsonPath("$.queryState.filters.children[0].field").value("status"))
            .andExpect(jsonPath("$.queryState.sorting[0].field").value("name"))
    }

    @Test
    fun `issue and project views share normalized queryState schema while keeping resource defaults`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspacePayload = createWorkspace(token, "views-${UUID.randomUUID().toString().take(8)}", "Views QueryState Workspace")
        val organizationId = workspacePayload["organization"]["id"].asLong()

        val issueViewPayload = mockMvc.perform(
            post("/api/views")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "resourceType": "ISSUE",
                      "scopeType": "WORKSPACE",
                      "name": "Issue default schema"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val projectViewPayload = mockMvc.perform(
            post("/api/views")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "organizationId": $organizationId,
                      "resourceType": "PROJECT",
                      "scopeType": "WORKSPACE",
                      "name": "Project default schema"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val issueQueryState = objectMapper.readTree(issueViewPayload)["queryState"]
        val projectQueryState = objectMapper.readTree(projectViewPayload)["queryState"]

        assertThat(issueQueryState.fieldNames().asSequence().toList())
            .containsExactly("filters", "display", "grouping", "subGrouping", "sorting")
        assertThat(projectQueryState.fieldNames().asSequence().toList())
            .containsExactly("filters", "display", "grouping", "subGrouping", "sorting")
        assertThat(issueQueryState["display"]["visibleColumns"].map { it.asText() })
            .containsExactly("identifier", "title", "priority", "state", "assignee", "project", "labels", "updatedAt", "createdAt")
        assertThat(projectQueryState["display"]["visibleColumns"].map { it.asText() })
            .containsExactly("key", "name", "status", "ownerId", "teamId", "updatedAt", "createdAt")
        assertThat(projectQueryState["subGrouping"]["field"].isNull).isTrue()
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

    @Test
    fun `workspace project list applies legacy-only view queryState fallback for filters and shared sorting semantics`() {
        val token = loginAndGetToken("admin", "admin123")
        val workspacePayload = createWorkspace(token, "projects-${UUID.randomUUID().toString().take(8)}", "Legacy Project View Workspace")
        val organizationId = workspacePayload["organization"]["id"].asLong()
        val teamId = workspacePayload["initialTeam"]["id"].asLong()

        fun createProject(name: String, status: String, targetDate: String?) {
            val targetDateJson = targetDate?.let { ",\n                          \"targetDate\": \"$it\"" } ?: ""
            mockMvc.perform(
                post("/api/projects")
                    .header("Authorization", "Bearer $token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "organizationId": $organizationId,
                          "teamId": $teamId,
                          "name": "$name",
                          "status": "$status"$targetDateJson
                        }
                        """.trimIndent()
                    )
            )
                .andExpect(status().isCreated)
        }

        createProject(name = "Alpha Active", status = "ACTIVE", targetDate = "2026-05-01")
        createProject(name = "Beta Active", status = "ACTIVE", targetDate = null)
        createProject(name = "Zulu Active", status = "ACTIVE", targetDate = null)
        createProject(name = "Planned Project", status = "PLANNED", targetDate = "2026-01-01")

        val legacyView = viewRepository.save(
            View(
                organizationId = organizationId,
                resourceType = "PROJECT",
                scopeType = "WORKSPACE",
                ownerUserId = 1,
                name = "Legacy active projects",
                filterJson = """
                    {
                      "operator": "AND",
                      "children": [
                        { "field": "status", "operator": "is", "value": "ACTIVE" }
                      ]
                    }
                """.trimIndent(),
                sortJson = """
                    [
                      { "field": "targetDate", "direction": "asc", "nulls": "first" },
                      { "field": "name", "direction": "desc", "nulls": "last" }
                    ]
                """.trimIndent(),
                queryState = null,
                visibility = "WORKSPACE",
                layout = "LIST"
            )
        )

        mockMvc.perform(
            get("/api/projects/workspace")
                .header("Authorization", "Bearer $token")
                .param("organizationId", organizationId.toString())
                .param("viewId", legacyView.id.toString())
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.totalCount").value(3))
            .andExpect(jsonPath("$.items[0].name").value("Zulu Active"))
            .andExpect(jsonPath("$.items[1].name").value("Beta Active"))
            .andExpect(jsonPath("$.items[2].name").value("Alpha Active"))
    }

    @Test
    fun `workspace project list rejects inaccessible or cross-organization saved views`() {
        val adminToken = loginAndGetToken("admin", "admin123")
        val workspacePayload = createWorkspace(adminToken, "views-${UUID.randomUUID().toString().take(8)}", "Project View Access Workspace")
        val organizationId = workspacePayload["organization"]["id"].asLong()

        val personalView = viewRepository.save(
            View(
                organizationId = organizationId,
                resourceType = "PROJECT",
                scopeType = "WORKSPACE",
                ownerUserId = 999_999,
                name = "Unowned personal project view",
                queryState = """
                    {
                      "filters": { "operator": "AND", "children": [] },
                      "display": { "layout": "LIST", "visibleColumns": ["name"] },
                      "grouping": { "field": null },
                      "subGrouping": { "field": null },
                      "sorting": [{ "field": "name", "direction": "asc", "nulls": "last" }]
                    }
                """.trimIndent(),
                visibility = "PERSONAL",
                layout = "LIST"
            )
        )

        mockMvc.perform(
            get("/api/projects/workspace")
                .header("Authorization", "Bearer $adminToken")
                .param("organizationId", organizationId.toString())
                .param("viewId", personalView.id.toString())
        )
            .andExpect(status().isForbidden)

        val otherWorkspacePayload = createWorkspace(adminToken, "views-${UUID.randomUUID().toString().take(8)}", "Other Workspace")
        val otherOrganizationId = otherWorkspacePayload["organization"]["id"].asLong()
        val crossOrgView = viewRepository.save(
            View(
                organizationId = otherOrganizationId,
                resourceType = "PROJECT",
                scopeType = "WORKSPACE",
                ownerUserId = 1,
                name = "Cross org project view",
                queryState = """
                    {
                      "filters": { "operator": "AND", "children": [] },
                      "display": { "layout": "LIST", "visibleColumns": ["name"] },
                      "grouping": { "field": null },
                      "subGrouping": { "field": null },
                      "sorting": [{ "field": "name", "direction": "asc", "nulls": "last" }]
                    }
                """.trimIndent(),
                visibility = "WORKSPACE",
                layout = "LIST"
            )
        )

        mockMvc.perform(
            get("/api/projects/workspace")
                .header("Authorization", "Bearer $adminToken")
                .param("organizationId", organizationId.toString())
                .param("viewId", crossOrgView.id.toString())
        )
            .andExpect(status().isNotFound)
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
