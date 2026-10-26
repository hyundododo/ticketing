package com.hello.ticketingbackend.domain.seat.service;

import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import com.hello.ticketingbackend.domain.concert.repository.ConcertRepository;
import com.hello.ticketingbackend.domain.seat.dto.SeatRequest;
import com.hello.ticketingbackend.domain.seat.dto.SeatResponse;
import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import com.hello.ticketingbackend.domain.seat.repository.SeatRepository;
import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import com.hello.ticketingbackend.domain.user.repository.UserRepository;
import com.hello.ticketingbackend.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final ConcertRepository concertRepository;
    @Transactional
    public Long createSeat(SeatRequest request) {

        ConcertEntity concertEntity = concertRepository.findById(request.getConcertId())
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));

        SeatEntity seatEntity = new SeatEntity(concertEntity);


        return seatRepository.save(seatEntity).getId();
    }
    @Transactional(readOnly = true)
    public List<SeatResponse> readSeats(Long concertId) {
        List<SeatResponse> list = seatRepository.findByConcertId(concertId).stream()
                .map(SeatResponse::from)
                .toList();
        return list;
    }
    @Transactional
    public void hold(Long seatId) {
        SeatEntity seat = seatRepository.findByIdForUpdate(seatId)
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));
        seat.hold();
    }

    @Transactional
    public void release(Long seatId) {
        SeatEntity seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));
        seat.release();
    }

    @Transactional
    public void confirm(Long seatId) {
        SeatEntity seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));
        seat.confirm();
    }

    @Transactional
    public void cancel(Long seatId) {
        SeatEntity seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));
        seat.cancel();
    }
}
