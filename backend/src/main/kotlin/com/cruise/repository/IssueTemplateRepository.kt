package com.cruise.repository

import com.cruise.entity.IssueTemplate
import org.springframework.data.jpa.repository.JpaRepository

interface IssueTemplateRepository : JpaRepository<IssueTemplate, Long>
