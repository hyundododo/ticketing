package com.hello.ticketingbackend.domain.seat.repository;

import com.hello.ticketingbackend.domain.seat.dto.SeatStatus;
import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<SeatEntity, Long> {
    List<SeatEntity> findByConcertId(Long concertId);

    @Query("select s.id from SeatEntity s where s.status = :status and s.heldUntil < :now")
    List<Long> findExpiredHeldSeatIds(@Param("status") SeatStatus status,
                                      @Param("now") LocalDateTime now);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))
    @Query("select s from SeatEntity s where s.id = :id")
    Optional<SeatEntity> findByIdForUpdate(@Param("id") Long id);

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
