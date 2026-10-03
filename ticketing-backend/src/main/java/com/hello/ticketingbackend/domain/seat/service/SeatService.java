package com.hello.ticketingbackend.domain.seat.service;

import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import com.hello.ticketingbackend.domain.concert.repository.ConcertRepository;
import com.hello.ticketingbackend.domain.seat.dto.SeatRequest;
import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import com.hello.ticketingbackend.domain.seat.repository.SeatRepository;
import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import com.hello.ticketingbackend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SeatService {
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final ConcertRepository concertRepository;

    public Long createSeat(SeatRequest request) {

        ConcertEntity concertEntity = concertRepository.findById(request.getConcertId())
                .orElseThrow(IllegalArgumentException::new);

        SeatEntity seatEntity = new SeatEntity(concertEntity);


        return seatRepository.save(seatEntity).getId();
    }


}
