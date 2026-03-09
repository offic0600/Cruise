package com.cruise.config

import com.cruise.entity.*
import com.cruise.repository.*
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.LocalDate

@Configuration
open class DataInitializer {

    @Bean
    open fun initData(
        projectRepository: ProjectRepository,
        userRepository: UserRepository,
        teamMemberRepository: TeamMemberRepository,
        requirementTagRepository: RequirementTagRepository,
        requirementRepository: RequirementRepository,
        taskRepository: TaskRepository,
        passwordEncoder: PasswordEncoder
    ): CommandLineRunner {
        return CommandLineRunner {
            // Init project if empty
            if (projectRepository.count() == 0L) {
                projectRepository.save(
                    Project(
                        name = "智能开发管理平台",
                        description = "面向软件开发过程的智能管理平台",
                        status = "ACTIVE"
                    )
                )
            }

            // Init admin user if empty
            if (userRepository.count() == 0L) {
                userRepository.save(
                    User(
                        username = "admin",
                        password = passwordEncoder.encode("admin123"),
                        email = "admin@cruise.com",
                        role = "ADMIN"
                    )
                )
            }

            // Init team members if empty
            if (teamMemberRepository.count() == 0L) {
                val members = listOf(
                    TeamMember(name = "张三", email = "zhangsan@cruise.com", role = "PM", skills = "项目管理,需求分析", teamId = 1),
                    TeamMember(name = "李四", email = "lisi@cruise.com", role = "LEAD", skills = "架构设计,Kotlin,Spring Boot", teamId = 1),
                    TeamMember(name = "王五", email = "wangwu@cruise.com", role = "DEVELOPER", skills = "React,Next.js,TypeScript", teamId = 1),
                    TeamMember(name = "赵六", email = "zhaoliu@cruise.com", role = "DEVELOPER", skills = "Kotlin,PostgreSQL,Docker", teamId = 1),
                    TeamMember(name = "钱七", email = "qianqi@cruise.com", role = "TESTER", skills = "自动化测试,JMeter,Selenium", teamId = 1),
                    TeamMember(name = "孙八", email = "sunba@cruise.com", role = "ARCHITECT", skills = "系统架构,微服务,DevOps", teamId = 1)
                )
                members.forEach { teamMemberRepository.save(it) }
            }

            // Init requirement tags if empty
            if (requirementTagRepository.count() == 0L) {
                val tags = listOf(
                    RequirementTag(name = "功能需求", color = "#3B82F6", sortOrder = 1),
                    RequirementTag(name = "缺陷修复", color = "#EF4444", sortOrder = 2),
                    RequirementTag(name = "性能优化", color = "#F59E0B", sortOrder = 3),
                    RequirementTag(name = "安全加固", color = "#8B5CF6", sortOrder = 4),
                    RequirementTag(name = "用户体验", color = "#10B981", sortOrder = 5),
                    RequirementTag(name = "技术债务", color = "#6B7280", sortOrder = 6)
                )
                tags.forEach { requirementTagRepository.save(it) }
            }

            // Init requirements if empty
            if (requirementRepository.count() == 0L) {
                val requirements = listOf(
                    Requirement(
                        title = "用户认证模块开发",
                        description = "实现用户登录、注册、登出功能，支持JWT令牌认证",
                        status = "IN_PROGRESS",
                        priority = "HIGH",
                        projectId = 1,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 3, 1),
                        expectedDeliveryDate = LocalDate.of(2026, 3, 15),
                        requirementOwnerId = 1,
                        productOwnerId = 1,
                        devOwnerId = 2,
                        devParticipants = "张三,李四",
                        testOwnerId = 5,
                        progress = 60,
                        tags = "功能需求",
                        estimatedDays = 10f,
                        plannedDays = 8f,
                        gapDays = 0f,
                        gapBudget = 0f,
                        actualDays = 5f,
                        applicationCodes = "cruise-auth",
                        vendors = "",
                        vendorStaff = "",
                        createdBy = "admin"
                    ),
                    Requirement(
                        title = "需求管理模块",
                        description = "实现需求的增删改查、状态流转、优先级管理",
                        status = "NEW",
                        priority = "HIGH",
                        projectId = 1,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 3, 10),
                        expectedDeliveryDate = LocalDate.of(2026, 3, 25),
                        requirementOwnerId = 1,
                        productOwnerId = 1,
                        devOwnerId = 3,
                        testOwnerId = 5,
                        progress = 0,
                        tags = "功能需求",
                        estimatedDays = 12f,
                        plannedDays = 10f,
                        gapDays = 0f,
                        gapBudget = 0f,
                        actualDays = 0f,
                        applicationCodes = "cruise-core",
                        vendors = "",
                        vendorStaff = "",
                        createdBy = "admin"
                    ),
                    Requirement(
                        title = "任务管理模块",
                        description = "实现任务的拆解、分配、进度跟踪、工时记录",
                        status = "NEW",
                        priority = "MEDIUM",
                        projectId = 1,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 3, 15),
                        expectedDeliveryDate = LocalDate.of(2026, 3, 30),
                        requirementOwnerId = 1,
                        productOwnerId = 1,
                        devOwnerId = 4,
                        testOwnerId = 5,
                        progress = 0,
                        tags = "功能需求",
                        estimatedDays = 10f,
                        plannedDays = 8f,
                        gapDays = 0f,
                        gapBudget = 0f,
                        actualDays = 0f,
                        applicationCodes = "cruise-core",
                        vendors = "",
                        vendorStaff = "",
                        createdBy = "admin"
                    ),
                    Requirement(
                        title = "仪表盘看板开发",
                        description = "实现多角色视图的仪表盘，展示项目统计、需求/任务概览",
                        status = "COMPLETED",
                        priority = "MEDIUM",
                        projectId = 1,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 2, 20),
                        expectedDeliveryDate = LocalDate.of(2026, 3, 5),
                        requirementOwnerId = 1,
                        productOwnerId = 1,
                        devOwnerId = 3,
                        testOwnerId = 5,
                        progress = 100,
                        tags = "功能需求,用户体验",
                        estimatedDays = 8f,
                        plannedDays = 7f,
                        gapDays = 0f,
                        gapBudget = 0f,
                        actualDays = 7f,
                        applicationCodes = "cruise-frontend",
                        vendors = "",
                        vendorStaff = "",
                        createdBy = "admin"
                    ),
                    Requirement(
                        title = "API性能优化",
                        description = "优化后端API响应时间，添加缓存机制",
                        status = "NEW",
                        priority = "LOW",
                        projectId = 1,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 4, 1),
                        expectedDeliveryDate = LocalDate.of(2026, 4, 15),
                        requirementOwnerId = 1,
                        productOwnerId = 1,
                        devOwnerId = 6,
                        testOwnerId = 5,
                        progress = 0,
                        tags = "性能优化",
                        estimatedDays = 5f,
                        plannedDays = 4f,
                        gapDays = 0f,
                        gapBudget = 0f,
                        actualDays = 0f,
                        applicationCodes = "cruise-api",
                        vendors = "",
                        vendorStaff = "",
                        createdBy = "admin"
                    )
                )
                requirements.forEach { requirementRepository.save(it) }
            }

            // Init tasks if empty
            if (taskRepository.count() == 0L) {
                val tasks = listOf(
                    // 用户认证相关任务
                    Task(
                        title = "设计数据库用户表结构",
                        description = "设计app_user表结构，包含username, password, email, role字段",
                        status = "COMPLETED",
                        requirementId = 1,
                        assigneeId = 2,
                        progress = 100,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 3, 1),
                        plannedEndDate = LocalDate.of(2026, 3, 2),
                        estimatedDays = 1f,
                        plannedDays = 1f,
                        remainingDays = 0f,
                        estimatedHours = 8f,
                        actualHours = 8f
                    ),
                    Task(
                        title = "实现JWT认证过滤器",
                        description = "实现JwtAuthenticationFilter，处理请求token验证",
                        status = "IN_PROGRESS",
                        requirementId = 1,
                        assigneeId = 2,
                        progress = 80,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 3, 2),
                        plannedEndDate = LocalDate.of(2026, 3, 5),
                        estimatedDays = 3f,
                        plannedDays = 3f,
                        remainingDays = 0.5f,
                        estimatedHours = 24f,
                        actualHours = 20f
                    ),
                    Task(
                        title = "开发登录注册API",
                        description = "开发/api/auth/login和/api/auth/register接口",
                        status = "IN_PROGRESS",
                        requirementId = 1,
                        assigneeId = 4,
                        progress = 50,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 3, 5),
                        plannedEndDate = LocalDate.of(2026, 3, 8),
                        estimatedDays = 3f,
                        plannedDays = 2.5f,
                        remainingDays = 1f,
                        estimatedHours = 24f,
                        actualHours = 12f
                    ),
                    Task(
                        title = "前端登录页面开发",
                        description = "开发美观的登录页面，包含表单验证",
                        status = "PENDING",
                        requirementId = 1,
                        assigneeId = 3,
                        progress = 0,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 3, 8),
                        plannedEndDate = LocalDate.of(2026, 3, 12),
                        estimatedDays = 4f,
                        plannedDays = 3f,
                        remainingDays = 3f,
                        estimatedHours = 32f,
                        actualHours = 0f
                    ),
                    // 需求管理相关任务
                    Task(
                        title = "设计需求实体类",
                        description = "设计Requirement实体，包含所有需求字段",
                        status = "PENDING",
                        requirementId = 2,
                        assigneeId = 2,
                        progress = 0,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 3, 10),
                        plannedEndDate = LocalDate.of(2026, 3, 12),
                        estimatedDays = 2f,
                        plannedDays = 2f,
                        remainingDays = 2f,
                        estimatedHours = 16f,
                        actualHours = 0f
                    ),
                    Task(
                        title = "开发需求CRUD API",
                        description = "开发需求的增删改查接口",
                        status = "PENDING",
                        requirementId = 2,
                        assigneeId = 4,
                        progress = 0,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 3, 12),
                        plannedEndDate = LocalDate.of(2026, 3, 18),
                        estimatedDays = 5f,
                        plannedDays = 4f,
                        remainingDays = 4f,
                        estimatedHours = 40f,
                        actualHours = 0f
                    ),
                    Task(
                        title = "开发需求管理前端页面",
                        description = "开发需求列表、新增、编辑页面",
                        status = "PENDING",
                        requirementId = 2,
                        assigneeId = 3,
                        progress = 0,
                        teamId = 1,
                        plannedStartDate = LocalDate.of(2026, 3, 15),
                        plannedEndDate = LocalDate.of(2026, 3, 25),
                        estimatedDays = 8f,
                        plannedDays = 6f,
                        remainingDays = 6f,
                        estimatedHours = 64f,
                        actualHours = 0f
                    )
                )
                tasks.forEach { taskRepository.save(it) }
            }

            println("=== Test data initialized successfully ===")
        }
    }
}
