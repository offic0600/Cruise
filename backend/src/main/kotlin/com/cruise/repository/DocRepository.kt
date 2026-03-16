package com.cruise.repository

import com.cruise.entity.Doc
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DocRepository : JpaRepository<Doc, Long>
