package com.hello.ticketingbackend.controller;

import com.hello.ticketingbackend.domain.cart.dto.CartRequest;
import com.hello.ticketingbackend.domain.cart.dto.CartResponse;
import com.hello.ticketingbackend.domain.cart.service.CartService;
import com.hello.ticketingbackend.domain.seat.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final SeatService seatService;

    @GetMapping("/api/items")
    public ResponseEntity<List<CartResponse>> readItems(@AuthenticationPrincipal String username) {
        return ResponseEntity.ok().body(cartService.readItems(username));
    }

    @PostMapping("/api/items")
    public ResponseEntity<Long> addItem(@RequestBody CartRequest request,
                                        @AuthenticationPrincipal String username) {

        return ResponseEntity.created(URI.create("/api/items"))
                .body(cartService.addItem(request, username));
    }
    //결제 완료 시 장바구니에서 삭제
    @DeleteMapping("/api/items")
    public ResponseEntity<Void> deleteItem(@RequestBody CartRequest request,
                                        @AuthenticationPrincipal String username) {
        cartService.deleteItem(request, username);
        return ResponseEntity.noContent().build();
    }

    //결제 전 장바구니에서 삭제
    @DeleteMapping("/api/items/release")
    public ResponseEntity<Void> releaseItem(@RequestBody CartRequest request,
                                        @AuthenticationPrincipal String username) {
        cartService.deleteItem(request, username);
        seatService.release(request.getSeatId());
        return ResponseEntity.noContent().build();
    }


}
