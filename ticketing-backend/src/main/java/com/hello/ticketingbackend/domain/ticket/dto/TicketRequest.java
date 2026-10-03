package com.hello.ticketingbackend.domain.ticket.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TicketRequest {
    private Long userId;
    private Long seatId;
}
