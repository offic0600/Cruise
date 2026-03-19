package com.cruise.repository

import com.cruise.entity.NotificationSubscription
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface NotificationSubscriptionRepository : JpaRepository<NotificationSubscription, Long>
