package com.hello.ticketingbackend.domain.concert.dto;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Lob;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ConcertRequest {
    private String concertName;
    private Long seatCount;

    private String place;

    private String description;
    private String posterUrl;

    private ConcertStatus concertStatus;
    private LocalDateTime bookingOpenAt;
}
