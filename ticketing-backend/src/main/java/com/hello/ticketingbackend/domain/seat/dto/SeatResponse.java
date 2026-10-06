package com.hello.ticketingbackend.domain.seat.dto;

import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import lombok.Getter;

@Getter
public class SeatResponse {
    private Long id;
    private SeatStatus status;

    public SeatResponse(Long id, SeatStatus status) {
        this.id = id;
        this.status = status;
    }

    public static SeatResponse from(SeatEntity entity) {
        return new SeatResponse(
                entity.getId(),
                entity.getStatus()
        );
    }
}
