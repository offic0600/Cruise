package com.cruise.repository

import com.cruise.entity.IssueDeliveryPlan
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IssueDeliveryPlanRepository : JpaRepository<IssueDeliveryPlan, Long>
