package com.hello.ticketingbackend.domain.ticket.dto;

import com.hello.ticketingbackend.domain.ticket.entity.TicketEntity;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class TicketResponse {
    private Long id;
    private Long userId;
    private Long concertId;
    private String concertName;
    private Long seatId;
    private LocalDateTime createdDate;

    public TicketResponse(Long id, Long userId, Long concertId,String concertName,
                          Long seatId, LocalDateTime createdDate) {
        this.id = id;
        this.userId = userId;
        this.concertId = concertId;
        this.concertName = concertName;
        this.seatId = seatId;
        this.createdDate = createdDate;
    }

    public static TicketResponse from(TicketEntity entity) {
        return new TicketResponse(
                entity.getId(),
                entity.getUser().getId(),
                entity.getSeat().getConcert().getId(),
                entity.getSeat().getConcert().getConcertName(),
                entity.getSeat().getId(),
                entity.getCreatedDate()
        );
    }
}
