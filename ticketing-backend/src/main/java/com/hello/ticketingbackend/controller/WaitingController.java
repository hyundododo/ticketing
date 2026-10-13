package com.hello.ticketingbackend.controller;

import com.hello.ticketingbackend.domain.waiting.service.WaitingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/waiting")
public class WaitingController {

    private final WaitingService waitingService;

    @PostMapping("/request")
    public ResponseEntity<String> request(@RequestParam String userId) {
        waitingService.enqueue(userId);
        return ResponseEntity.ok("접속 요청 완료: 대기열에 등록되었습니다.");
    }

    @GetMapping("/status")
    public ResponseEntity<String> status(@RequestParam String userId) {
        if (waitingService.isAllowed(userId)) {
            return ResponseEntity.ok("접속 가능");
        } else {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("대기 중");
        }
    }

    @Scheduled(fixedRate = 1000)
    public void processQueue() {
        String userId = waitingService.dequeue();
        if (userId != null) {
            waitingService.allowUser(userId);
            System.out.println("접속 허용: " + userId);
        }
    }

}
