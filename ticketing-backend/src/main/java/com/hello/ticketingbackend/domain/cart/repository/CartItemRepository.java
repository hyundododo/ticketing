package com.hello.ticketingbackend.domain.cart.repository;

import com.hello.ticketingbackend.domain.cart.entity.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {

    @Modifying(clearAutomatically = true)
    @Query("delete from CartItemEntity c where c.seat.id in :seatIds")
    int deleteBySeatIds(@Param("seatIds") List<Long> seatIds);
}
