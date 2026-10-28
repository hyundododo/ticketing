package com.hello.ticketingbackend.domain.concert.entity;

import com.hello.ticketingbackend.domain.concert.dto.ConcertStatus;
import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class ConcertEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String concertName;

    @OneToMany(mappedBy = "concert", cascade = CascadeType.REMOVE)
    private List<SeatEntity> seats = new ArrayList<>();

    private String place;

    @Lob
    private String description;
    private String posterUrl;

    @Enumerated(EnumType.STRING)
    private ConcertStatus concertStatus;
    private LocalDateTime bookingOpenAt;

    @CreatedDate
    private LocalDateTime createdDate;
    @LastModifiedDate
    private LocalDateTime updatedDate;

    public ConcertEntity(String concertName) {
        this.concertName = concertName;
    }
}
