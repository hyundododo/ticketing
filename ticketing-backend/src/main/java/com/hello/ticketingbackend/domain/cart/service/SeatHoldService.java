package com.hello.ticketingbackend.domain.cart.service;

import com.hello.ticketingbackend.domain.cart.repository.CartItemRepository;
import com.hello.ticketingbackend.domain.seat.dto.SeatStatus;
import com.hello.ticketingbackend.domain.seat.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatHoldService {
    private final SeatRepository seatRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional
    public void releaseExpiredHolds() {
        List<Long> ids = seatRepository.findExpiredHeldSeatIds(SeatStatus.HELD, LocalDateTime.now());
        if (ids.isEmpty()) return;
        int removed = cartItemRepository.deleteBySeatIds(ids);
        int released = seatRepository.releaseExpiredHolds(LocalDateTime.now());

        if (released > 0) {
            log.info("만료된 HELD 좌석 {}개 해제, 장바구니 항목 {}개 삭제", released, removed);
        }
    }
}
