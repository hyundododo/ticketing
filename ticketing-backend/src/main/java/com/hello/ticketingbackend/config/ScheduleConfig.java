package com.hello.ticketingbackend.config;

import com.hello.ticketingbackend.domain.cart.service.SeatHoldService;
import com.hello.ticketingbackend.domain.jwt.repository.RefreshRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class ScheduleConfig {
    private final RefreshRepository refreshRepository;
    private final SeatHoldService seatHoldService;


    // Refresh 토큰 저장소 8일 지난 토큰 삭제
    @Scheduled(cron = "0 0 3 * * *")
    public void refreshEntityTtlSchedule() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(8);
        refreshRepository.deleteByCreatedDateBefore(cutoff);
    }

    @Scheduled(fixedDelay = 30_000) // 이전 실행이 끝난 뒤 30초 후 다시 실행
    public void releaseExpiredHolds() {
        seatHoldService.releaseExpiredHolds();
    }
}
