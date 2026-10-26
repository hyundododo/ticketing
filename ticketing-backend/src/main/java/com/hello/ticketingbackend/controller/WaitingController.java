package com.hello.ticketingbackend.controller;

import com.hello.ticketingbackend.domain.waiting.dto.WaitingResponse;
import com.hello.ticketingbackend.domain.waiting.service.WaitingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/waiting")
public class WaitingController {

    private final WaitingService waitingService;

    @PostMapping("/enter")
    public ResponseEntity<WaitingResponse> enter(String concertId,@AuthenticationPrincipal String userId) {
        if (waitingService.isAllowed(concertId, userId)) {
            return ResponseEntity.ok(WaitingResponse.allowed());
        }
        waitingService.enqueue(concertId,userId);
        Long rank = waitingService.rank(concertId,userId);
        return ResponseEntity.ok(WaitingResponse.waiting(rank));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> leave(String concertId,@AuthenticationPrincipal String userId) {
        waitingService.leave(concertId,userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status")
    public ResponseEntity<WaitingResponse> status(String concertId,@AuthenticationPrincipal String userId) {

        if (waitingService.isAllowed(concertId, userId)) {
            return ResponseEntity.ok(WaitingResponse.allowed());
        }

        Long rank = waitingService.rank(concertId, userId);
        if (rank != null) {
            return ResponseEntity.ok(WaitingResponse.waiting(rank));
        } else {
            return ResponseEntity.ok(WaitingResponse.none());
        }
    }
}
