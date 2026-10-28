package com.hello.ticketingbackend.controller;

import com.hello.ticketingbackend.domain.concert.dto.ConcertRequest;
import com.hello.ticketingbackend.domain.concert.dto.ConcertResponse;
import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import com.hello.ticketingbackend.domain.concert.service.ConcertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ConcertController {

    private final ConcertService concertService;

    @PostMapping("/api/concerts")
    public ResponseEntity<Long> createConcert(@RequestBody ConcertRequest request) {
        //admin 권한 검증

        return ResponseEntity.created(URI.create("api/concerts"))
                .body(concertService.creatConcert(request));
    }

    @DeleteMapping("/api/concerts/{concertId}")
    public ResponseEntity<Void> deleteConcert(@PathVariable Long concertId) {
        concertService.deleteConcert(concertId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/concerts")
    public ResponseEntity<List<ConcertResponse>> readConcerts() {
        return ResponseEntity.ok().body(concertService.readConcerts());
    }

    @GetMapping("/api/concerts/{concertId}")
    public ResponseEntity<ConcertResponse> readConcert(@PathVariable Long concertId) {
        return ResponseEntity.ok().body(concertService.readConcert(concertId));
    }


}
