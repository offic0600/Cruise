package com.cruise.service

data class RestPageInfo(
    val nextCursor: String? = null,
    val prevCursor: String? = null,
    val hasNextPage: Boolean = false,
    val hasPreviousPage: Boolean = false
)

data class RestPageResponse<T>(
    val items: List<T>,
    val pageInfo: RestPageInfo,
    val totalCount: Int
)

fun <T> List<T>.toRestPage(page: Int, size: Int): RestPageResponse<T> {
    val safePage = page.coerceAtLeast(0)
    val safeSize = size.coerceAtLeast(1)
    val total = this.size
    val fromIndex = (safePage * safeSize).coerceAtMost(total)
    val toIndex = (fromIndex + safeSize).coerceAtMost(total)
    val pageItems = subList(fromIndex, toIndex)
    return RestPageResponse(
        items = pageItems,
        pageInfo = RestPageInfo(
            nextCursor = if (toIndex < total) "${safePage + 1}" else null,
            prevCursor = if (safePage > 0) "${safePage - 1}" else null,
            hasNextPage = toIndex < total,
            hasPreviousPage = safePage > 0
        ),
        totalCount = total
    )
}
