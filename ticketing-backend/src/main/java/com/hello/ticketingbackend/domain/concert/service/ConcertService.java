package com.hello.ticketingbackend.domain.concert.service;

import com.hello.ticketingbackend.domain.concert.dto.ConcertRequest;
import com.hello.ticketingbackend.domain.concert.dto.ConcertResponse;
import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import com.hello.ticketingbackend.domain.concert.repository.ConcertRepository;
import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import com.hello.ticketingbackend.domain.seat.repository.SeatRepository;
import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import com.hello.ticketingbackend.exception.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConcertService {

    private final ConcertRepository concertRepository;
    private final SeatRepository seatRepository;

    @Transactional
    public Long creatConcert(ConcertRequest request) {
        //admin 권한검증 로직
        List<SeatEntity> seats = new ArrayList<>();

        ConcertEntity concertEntity = new ConcertEntity(request.getConcertName());
        ConcertEntity savedConcert = concertRepository.save(concertEntity);
        for (int i = 0; i < request.getSeatCount(); i++) {
            seats.add(new SeatEntity(savedConcert));
        }
        seatRepository.saveAll(seats);

        return savedConcert.getId();
    }
    @Transactional
    public void deleteConcert(Long concertId) {
        //admin 권한검증 로직

        ConcertEntity concertEntity = concertRepository.findById(concertId)
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));

        concertRepository.delete(concertEntity);
    }
    @Transactional
    public List<ConcertResponse> readConcerts() {
        List<ConcertResponse> list = concertRepository.findAll().stream()
                .map(ConcertResponse::from)
                .toList();

        return list;
    }
}
