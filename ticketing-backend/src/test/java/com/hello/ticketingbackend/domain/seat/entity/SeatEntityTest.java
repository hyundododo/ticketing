package com.hello.ticketingbackend.domain.seat.entity;

import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import com.hello.ticketingbackend.domain.concert.repository.ConcertRepository;
import com.hello.ticketingbackend.domain.seat.dto.SeatStatus;
import com.hello.ticketingbackend.domain.seat.repository.SeatRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest
class SeatEntityTest {

    @Autowired
    SeatRepository seatRepository;
    @Autowired
    ConcertRepository concertRepository;
    @Autowired
    PlatformTransactionManager txManager;

    Long seatId;

    @BeforeEach
    void setUp() {
        // ConcertEntity 생성 방식은 본인 코드에 맞게 수정
        ConcertEntity concert = concertRepository.save(new ConcertEntity("test concertName"));
        seatId = seatRepository.save(new SeatEntity(concert)).getId();
    }

    @AfterEach
    void tearDown() {
        seatRepository.deleteAll();
        concertRepository.deleteAll();
    }

    @Test
    @DisplayName("동시에_32명이_같은_좌석을_hold하면_1명만_성공해야_한다")
    void hold() throws InterruptedException {

        int threadCount = 32;
        ExecutorService executor = Executors.newFixedThreadPool(32);
        CountDownLatch ready = new CountDownLatch(threadCount); // 모든 스레드 준비 대기
        CountDownLatch start = new CountDownLatch(1);           // 동시에 출발
        CountDownLatch done = new CountDownLatch(threadCount);// 전부 끝날 때까지 대기

        AtomicInteger success = new AtomicInteger();
        AtomicInteger fail = new AtomicInteger();

        TransactionTemplate tx = new TransactionTemplate(txManager);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    tx.executeWithoutResult(status -> {
                        SeatEntity seat = seatRepository.findByIdForUpdate(seatId).orElseThrow();
                        seat.hold();   // 커밋 시점에 dirty checking으로 UPDATE
                    });
                    success.incrementAndGet();
                } catch (Exception e) {
                    // IllegalStateException, 락 예외 등 전부 실패로 집계
                    fail.incrementAndGet();
                } finally {
                    done.countDown();
                }
            });
    }

        ready.await();
        start.countDown();
        done.await();
        executor.shutdown();

        SeatEntity result = seatRepository.findById(seatId).orElseThrow();

        System.out.println("success = " + success.get() + ", fail = " + fail.get());
        assertThat(success.get()).isEqualTo(1);
        assertThat(fail.get()).isEqualTo(threadCount - 1);
        assertThat(result.getStatus()).isEqualTo(SeatStatus.HELD);
    }
}