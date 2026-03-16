package com.cruise.repository

import com.cruise.entity.IssueExtensionPayload
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IssueExtensionPayloadRepository : JpaRepository<IssueExtensionPayload, Long>
