package com.cruise.repository

import com.cruise.entity.IssueTag
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IssueTagRepository : JpaRepository<IssueTag, Long> {
    fun findByOrderBySortOrderAsc(): List<IssueTag>
}
