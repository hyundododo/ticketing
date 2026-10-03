package com.hello.ticketingbackend.controller;

import com.hello.ticketingbackend.domain.ticket.dto.TicketRequest;
import com.hello.ticketingbackend.domain.ticket.service.TicketService;
import com.hello.ticketingbackend.domain.user.dto.UserRequestDTO;
import com.hello.ticketingbackend.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;

    @PostMapping("/api/tickets/{seatId}")
    public ResponseEntity<Long> createTicket(@PathVariable Long seatId, @AuthenticationPrincipal String username) {
        Long userId = userService.findByUsername(username);

        TicketRequest request = new TicketRequest();
        request.setUserId(userId);
        request.setSeatId(seatId);

        return ResponseEntity.created(URI.create("api/tickets"))
                .body(ticketService.createTicket(request));
    }

    @DeleteMapping("/api/tickets/{ticketId}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long ticketId,
                                             @AuthenticationPrincipal String username) throws IllegalAccessException {
        ticketService.deleteTicket(ticketId,username);
        return ResponseEntity.noContent().build();
    }
}
