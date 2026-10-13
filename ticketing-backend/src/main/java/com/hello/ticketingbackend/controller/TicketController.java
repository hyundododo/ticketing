package com.hello.ticketingbackend.controller;

import com.hello.ticketingbackend.domain.seat.service.SeatService;
import com.hello.ticketingbackend.domain.ticket.dto.TicketRequest;
import com.hello.ticketingbackend.domain.ticket.dto.TicketResponse;
import com.hello.ticketingbackend.domain.ticket.service.TicketService;
import com.hello.ticketingbackend.domain.user.dto.UserRequestDTO;
import com.hello.ticketingbackend.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;
    private final SeatService seatService;
    @PostMapping("/api/tickets/{seatId}")
    public ResponseEntity<Long> createTicket(@PathVariable Long seatId, @AuthenticationPrincipal String username) {
        Long userId = userService.findByUsername(username);

        TicketRequest request = new TicketRequest();
        request.setUserId(userId);
        request.setSeatId(seatId);

        return ResponseEntity.created(URI.create("/api/tickets"))
                .body(ticketService.createTicket(request));
    }

//    @GetMapping("/api/tickets/{ticketId}")
//    public ResponseEntity<TicketResponse> readTicket(@PathVariable Long ticketId) {
//        return ResponseEntity.ok().body(ticketService.readTicket(ticketId));
//    }

    @GetMapping("/api/tickets")
    public ResponseEntity<List<TicketResponse>> readTickets(@AuthenticationPrincipal String username) {
        Long userId = userService.findByUsername(username);
        return ResponseEntity.ok().body(ticketService.readTicket(userId));
    }

    @DeleteMapping("/api/tickets/{ticketId}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long ticketId,
                                             @AuthenticationPrincipal String username) throws IllegalAccessException {
        ticketService.deleteTicket(ticketId,username);
        return ResponseEntity.noContent().build();
    }
}
