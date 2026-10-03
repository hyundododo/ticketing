package com.hello.ticketingbackend.domain.ticket.service;

import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import com.hello.ticketingbackend.domain.seat.repository.SeatRepository;
import com.hello.ticketingbackend.domain.ticket.dto.TicketRequest;
import com.hello.ticketingbackend.domain.ticket.dto.TicketResponse;
import com.hello.ticketingbackend.domain.ticket.entity.TicketEntity;
import com.hello.ticketingbackend.domain.ticket.repository.TicketRepository;
import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import com.hello.ticketingbackend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final SeatRepository seatRepository;

    public Long createTicket(TicketRequest request) {
        UserEntity userEntity = userRepository.findById(request.getUserId())
                .orElseThrow(IllegalArgumentException::new);

        SeatEntity seatEntity = seatRepository.findById(request.getSeatId())
                .orElseThrow(IllegalArgumentException::new);

        seatEntity.occupy(); // 좌석 예매(좌석 선택 후 10분 동안 결제 안하면 취소시키는 로직 추가예정)

        TicketEntity ticketEntity = new TicketEntity(userEntity,seatEntity);
        return ticketRepository.save(ticketEntity).getId();
    }

    public void deleteTicket(Long ticketId, String username) throws IllegalAccessException {
        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(IllegalArgumentException::new);
        if (!ticket.getUser().getUsername().equals(username)) {
            throw new IllegalAccessException("본인의 티켓만 삭제 가능합니다.");
        }
        ticketRepository.delete(ticket);
    }

    public List<TicketResponse> readTicket(Long userId) {
        return ticketRepository.findByuserId(userId).stream()
                .map(TicketResponse::from)
                .toList();
    }


}
