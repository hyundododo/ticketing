package com.hello.ticketingbackend.domain.seat.repository;

import com.hello.ticketingbackend.domain.seat.dto.SeatStatus;
import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<SeatEntity, Long> {
    List<SeatEntity> findByConcertId(Long concertId);

    @Query("select s.id from SeatEntity s where s.status = :status and s.heldUntil < :now")
    List<Long> findExpiredHeldSeatIds(@Param("status") SeatStatus status,
                                      @Param("now") LocalDateTime now);

    @Modifying(clearAutomatically = true)
    @Query("""
        update SeatEntity s
           set s.status = com.hello.ticketingbackend.domain.seat.dto.SeatStatus.AVAILABLE,
               s.heldUntil = null
         where s.status = com.hello.ticketingbackend.domain.seat.dto.SeatStatus.HELD
           and s.heldUntil < :now
        """)
    int releaseExpiredHolds(@Param("now") LocalDateTime now);

}
