package com.hello.ticketingbackend.domain.seat.entity;

import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Getter
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SeatEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "concert_id")
    private ConcertEntity concert;

    private Boolean isOccupied = false;

    public SeatEntity(ConcertEntity concert) {
        this.concert = concert;
    }

    public void occupy() {
        if (this.isOccupied) {
            throw new IllegalStateException("이미 예매된 좌석입니다.");
        }
        this.isOccupied = true;
    }
}
