package com.hello.ticketingbackend.domain.seat.dto;

import jakarta.persistence.Column;
import lombok.Getter;

@Getter
public class SeatRequest {
    private Long concertId;
    private int price;
}
