package com.hello.ticketingbackend.domain.concert.dto;

import lombok.Getter;

@Getter
public class
ConcertRequest {
    private String concertName;
    private Long seatCount;
}
