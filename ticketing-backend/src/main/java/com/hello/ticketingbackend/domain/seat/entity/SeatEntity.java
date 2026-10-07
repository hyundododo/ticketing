package com.hello.ticketingbackend.domain.seat.entity;

import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import com.hello.ticketingbackend.domain.seat.dto.SeatStatus;
import com.hello.ticketingbackend.domain.ticket.entity.TicketEntity;
import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SeatEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concert_id")
    private ConcertEntity concert;


    @OneToOne(mappedBy = "seat", cascade = CascadeType.REMOVE)
    private TicketEntity ticket;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status = SeatStatus.AVAILABLE;

    @Column
    private LocalDateTime heldUntil;

    //    private Boolean isOccupied = false;

    public SeatEntity(ConcertEntity concert) {
        this.concert = concert;
    }

    public void hold() {
        boolean isExpired = this.status == SeatStatus.HELD
                && this.heldUntil != null
                && this.heldUntil.isBefore(LocalDateTime.now());
        if (!this.status.equals(SeatStatus.AVAILABLE) && !isExpired) {
            throw new IllegalStateException("AVAILABLE 상태가 아니거나 만료되었습니다.");
        }
        this.status = SeatStatus.HELD;
        this.heldUntil = LocalDateTime.now().plusMinutes(1); // 테스트용으로 1분 설정
    }

    public void release() {
        if (!this.status.equals(SeatStatus.HELD)) {
            throw new IllegalStateException("HELD 상태가 아닙니다.");
        }
        this.status = SeatStatus.AVAILABLE;
    }

    public void confirm() {
        if (!this.status.equals(SeatStatus.HELD)) {
            throw new IllegalStateException("HELD 상태가 아닙니다.");
        }
        this.status = SeatStatus.SOLD;
    }

    public void cancel() {
        if (!this.status.equals(SeatStatus.SOLD)) {
            throw new IllegalStateException("SOLD 상태가 아닙니다");
        }
        this.status = SeatStatus.AVAILABLE;
    }



/*    public void occupy() {
        if (this.isOccupied) {
            throw new IllegalStateException("이미 예매된 좌석입니다.");
        }
        this.isOccupied = true;
    }

    public void vacancy() {
        if (!this.isOccupied) {
            throw new IllegalStateException("이미 취소된 좌석입니다.");
        }
        this.isOccupied = false;
    }*/
}
