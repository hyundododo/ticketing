package com.hello.ticketingbackend.domain.waiting.service;

import com.hello.ticketingbackend.domain.concert.dto.ConcertResponse;
import com.hello.ticketingbackend.domain.concert.service.ConcertService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class QueueScheduler {
    private final WaitingService waitingService;
    private final ConcertService concertService;
    @Value("${queue.allow-count}")
    private int count;



    @Scheduled(fixedRate = 4000)
    public void processQueue() {
        List<String> concertIdList = concertService.readConcerts().stream()
                .map(ConcertResponse::getId)
                .map(String::valueOf)
                .toList();

        for (String id : concertIdList) {
            List<String> users = waitingService.popMin(id, count);
            for (String user : users) {
                waitingService.allowUser(id, user);
            }
        }
    }

}
