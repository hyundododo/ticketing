package com.hello.ticketingbackend.domain.waiting.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class QueueScheduler {
    private final WaitingService waitingService;
    @Value("${queue.allow-count}")
    private int count;


    @Scheduled(fixedRate = 4000)
    public void processQueue() {
        List<String> users = waitingService.popMin(count);
        for (String user : users) {
            waitingService.allowUser(user);
        }
    }

}
