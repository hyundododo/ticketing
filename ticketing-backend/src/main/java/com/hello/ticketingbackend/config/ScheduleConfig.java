package com.hello.ticketingbackend.config;

import com.hello.ticketingbackend.domain.cart.entity.CartEntity;
import com.hello.ticketingbackend.domain.cart.repository.CartItemRepository;
import com.hello.ticketingbackend.domain.cart.repository.CartRepository;
import com.hello.ticketingbackend.domain.cart.service.CartService;
import com.hello.ticketingbackend.domain.cart.service.SeatHoldService;
import com.hello.ticketingbackend.domain.jwt.repository.RefreshRepository;
import com.hello.ticketingbackend.domain.seat.dto.SeatStatus;
import com.hello.ticketingbackend.domain.seat.repository.SeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;

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
