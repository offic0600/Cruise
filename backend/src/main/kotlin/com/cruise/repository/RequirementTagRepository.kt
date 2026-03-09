package com.cruise.repository

import com.cruise.entity.RequirementTag
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface RequirementTagRepository : JpaRepository<RequirementTag, Long> {
    fun findByOrderBySortOrderAsc(): List<RequirementTag>
}
