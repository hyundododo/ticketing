package com.hello.ticketingbackend.domain.cart.repository;

import com.hello.ticketingbackend.domain.cart.entity.CartEntity;
import com.hello.ticketingbackend.domain.cart.entity.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface CartRepository extends JpaRepository<CartEntity,Long> {
    Optional<CartEntity> findByuserId(Long userId);


}
