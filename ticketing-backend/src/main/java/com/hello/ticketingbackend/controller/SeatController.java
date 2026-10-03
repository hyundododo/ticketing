package com.hello.ticketingbackend.controller;

import com.hello.ticketingbackend.domain.seat.dto.SeatRequest;
import com.hello.ticketingbackend.domain.seat.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @PostMapping("/api/seats")
    public ResponseEntity<Long> createSeat(@RequestBody SeatRequest request) {
        return ResponseEntity.created(URI.create("api/seats"))
                .body(seatService.createSeat(request));
    }

}
