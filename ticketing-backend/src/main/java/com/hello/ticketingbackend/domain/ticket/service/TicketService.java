package com.hello.ticketingbackend.domain.ticket.service;

import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import com.hello.ticketingbackend.domain.seat.repository.SeatRepository;
import com.hello.ticketingbackend.domain.ticket.dto.TicketRequest;
import com.hello.ticketingbackend.domain.ticket.dto.TicketResponse;
import com.hello.ticketingbackend.domain.ticket.entity.TicketEntity;
import com.hello.ticketingbackend.domain.ticket.repository.TicketRepository;
import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import com.hello.ticketingbackend.domain.user.repository.UserRepository;
import com.hello.ticketingbackend.exception.EntityNotFoundException;
import com.hello.ticketingbackend.exception.ForbiddenException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final SeatRepository seatRepository;
    @Transactional
    public Long createTicket(TicketRequest request) {
        UserEntity userEntity = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));

        SeatEntity seatEntity = seatRepository.findById(request.getSeatId())
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));

        TicketEntity ticketEntity = new TicketEntity(userEntity,seatEntity);
        return ticketRepository.save(ticketEntity).getId();
    }
    @Transactional
    public void deleteTicket(Long ticketId, String username){
        TicketEntity ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));
        if (!ticket.getUser().getUsername().equals(username)) {
            throw new ForbiddenException("본인의 티켓만 삭제 가능합니다.");
        }
        ticketRepository.delete(ticket);
    }
    @Transactional(readOnly = true)
    public List<TicketResponse> readTicket(Long userId) {
        return ticketRepository.findByuserId(userId).stream()
                .map(TicketResponse::from)
                .toList();
    }


}
