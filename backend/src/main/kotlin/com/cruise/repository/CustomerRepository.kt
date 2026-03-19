package com.cruise.repository

import com.cruise.entity.Customer
import org.springframework.data.jpa.repository.JpaRepository

interface CustomerRepository : JpaRepository<Customer, Long>

