package com.hello.ticketingbackend.domain.concert.dto;

import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
@Getter
public class ConcertResponse {
    private Long id;
    private String concertName;
    private String place;

    private String description;
    private String posterUrl;

    private ConcertStatus concertStatus;
    private LocalDateTime bookingOpenAt;


    public ConcertResponse(Long id, String concertName, String place, String description,
                           String posterUrl, ConcertStatus concertStatus, LocalDateTime bookingOpenAt) {
        this.id = id;
        this.concertName = concertName;
        this.place = place;
        this.description = description;
        this.posterUrl = posterUrl;
        this.concertStatus = concertStatus;
        this.bookingOpenAt = bookingOpenAt;
    }

    public static ConcertResponse from(ConcertEntity entity) {
        return new ConcertResponse(
                entity.getId(),
                entity.getConcertName(),
                entity.getPlace(),
                entity.getDescription(),
                entity.getPosterUrl(),
                entity.getConcertStatus(),
                entity.getBookingOpenAt()
        );
    }
}
