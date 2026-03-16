package com.cruise.repository

import com.cruise.entity.IssueFeatureExtension
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IssueFeatureExtensionRepository : JpaRepository<IssueFeatureExtension, Long>
