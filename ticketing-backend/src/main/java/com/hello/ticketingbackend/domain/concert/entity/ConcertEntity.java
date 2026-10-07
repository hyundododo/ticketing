package com.hello.ticketingbackend.domain.concert.entity;

import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class ConcertEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String concertName;

    @OneToMany(mappedBy = "concert", cascade = CascadeType.REMOVE)
    private List<SeatEntity> seats = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdDate;

    public ConcertEntity(String concertName) {
        this.concertName = concertName;
    }
}
