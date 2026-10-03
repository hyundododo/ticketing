package com.hello.ticketingbackend.domain.seat.repository;

import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<SeatEntity, Long> {
    List<SeatEntity> findByConcertId(Long concertId);

}
