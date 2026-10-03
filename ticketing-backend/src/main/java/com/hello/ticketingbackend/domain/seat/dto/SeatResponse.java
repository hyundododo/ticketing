package com.hello.ticketingbackend.domain.seat.dto;

import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import lombok.Getter;

@Getter
public class SeatResponse {
    private Long id;
    private Boolean isOccupied = false;

    public SeatResponse(Long id, Boolean isOccupied) {
        this.id = id;
        this.isOccupied = isOccupied;
    }

    public static SeatResponse from(SeatEntity entity) {
        return new SeatResponse(
                entity.getId(),
                entity.getIsOccupied()
        );
    }
}
