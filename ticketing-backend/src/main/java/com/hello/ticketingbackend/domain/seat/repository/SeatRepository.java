package com.hello.ticketingbackend.domain.seat.repository;

import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeatRepository extends JpaRepository<SeatEntity, Long> {


}
