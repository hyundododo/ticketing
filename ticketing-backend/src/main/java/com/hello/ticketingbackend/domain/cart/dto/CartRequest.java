package com.hello.ticketingbackend.domain.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
public class CartRequest {
    private Long userId;
    private Long seatId;
}
