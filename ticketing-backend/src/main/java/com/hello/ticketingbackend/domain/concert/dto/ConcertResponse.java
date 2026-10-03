package com.hello.ticketingbackend.domain.concert.dto;

import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class ConcertResponse {
    private Long id;
    private String concertName;

    public ConcertResponse(Long id, String concertName) {
        this.id = id;
        this.concertName = concertName;
    }

    public static ConcertResponse from(ConcertEntity entity) {
        return new ConcertResponse(
                entity.getId(),
                entity.getConcertName()
        );
    }
}
