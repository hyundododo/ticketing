package com.hello.ticketingbackend.controller;

import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import com.hello.ticketingbackend.domain.seat.dto.SeatRequest;
import com.hello.ticketingbackend.domain.seat.dto.SeatResponse;
import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import com.hello.ticketingbackend.domain.seat.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @PostMapping("/api/seats")
    public ResponseEntity<Long> createSeat(@RequestBody SeatRequest request) {
        return ResponseEntity.created(URI.create("api/seats"))
                .body(seatService.createSeat(request));
    }

    @GetMapping("/api/seats/{concertId}")
    public ResponseEntity<List<SeatResponse>> readSeats(@PathVariable Long concertId) {
        return ResponseEntity.ok().body(seatService.readSeats(concertId));
    }

}
