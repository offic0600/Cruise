package com.cruise.repository

import com.cruise.entity.IssueDraft
import org.springframework.data.jpa.repository.JpaRepository

interface IssueDraftRepository : JpaRepository<IssueDraft, Long>
