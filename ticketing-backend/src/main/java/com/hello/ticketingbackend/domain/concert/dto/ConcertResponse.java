package com.hello.ticketingbackend.domain.concert.dto;

import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
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

    private int price;


    public ConcertResponse(Long id, String concertName, String place, String description,
                           String posterUrl, ConcertStatus concertStatus, LocalDateTime bookingOpenAt, int price) {
        this.id = id;
        this.concertName = concertName;
        this.place = place;
        this.description = description;
        this.posterUrl = posterUrl;
        this.concertStatus = concertStatus;
        this.bookingOpenAt = bookingOpenAt;
        this.price = price;
    }

    public static ConcertResponse from(ConcertEntity entity) {
        return new ConcertResponse(
                entity.getId(),
                entity.getConcertName(),
                entity.getPlace(),
                entity.getDescription(),
                entity.getPosterUrl(),
                entity.getConcertStatus(),
                entity.getBookingOpenAt(),
                entity.getSeats().stream()
                        .map(SeatEntity::getPrice)
                        .toList().getFirst() // 같은 콘서트에서 좌석 가격이 다 같음
        );
    }
}
