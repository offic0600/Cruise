package com.cruise.repository

import com.cruise.entity.NotificationPreference
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface NotificationPreferenceRepository : JpaRepository<NotificationPreference, Long>
