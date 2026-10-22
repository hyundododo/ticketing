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
    public ResponseEntity<WaitingResponse> enter(@AuthenticationPrincipal String userId) {
        if (waitingService.isAllowed(userId)) {
            return ResponseEntity.ok(WaitingResponse.allowed());
        }
        waitingService.enqueue(userId);
        Long rank = waitingService.rank(userId);
        return ResponseEntity.ok(WaitingResponse.waiting(rank));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> leave(@AuthenticationPrincipal String userId) {
        waitingService.leave(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status")
    public ResponseEntity<WaitingResponse> status(@AuthenticationPrincipal String userId) {

        if (waitingService.isAllowed(userId)) {
            return ResponseEntity.ok(WaitingResponse.allowed());
        }

        Long rank = waitingService.rank(userId);
        if (rank != null) {
            return ResponseEntity.ok(WaitingResponse.waiting(rank));
        } else {
            return ResponseEntity.ok(WaitingResponse.none());
        }
    }



}
