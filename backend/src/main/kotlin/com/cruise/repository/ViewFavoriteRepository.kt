package com.cruise.repository

import com.cruise.entity.ViewFavorite
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ViewFavoriteRepository : JpaRepository<ViewFavorite, Long> {
    fun findByUserId(userId: Long): List<ViewFavorite>
    fun findByUserIdAndViewId(userId: Long, viewId: Long): ViewFavorite?
    fun findByViewId(viewId: Long): List<ViewFavorite>
}
