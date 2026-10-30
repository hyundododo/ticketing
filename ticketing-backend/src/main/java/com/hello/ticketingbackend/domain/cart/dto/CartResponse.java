package com.hello.ticketingbackend.domain.cart.dto;

import com.hello.ticketingbackend.domain.cart.entity.CartEntity;
import com.hello.ticketingbackend.domain.cart.entity.CartItemEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@AllArgsConstructor
public class CartResponse {

    private Long id;
    private Long cartId;
    private Long cartItemId;
    private Long seatId;
    private int price;
    private LocalDateTime heldUntil;

    public CartResponse(Long cartId, Long cartItemId, Long seatId, int price, LocalDateTime heldUntil) {
        this.cartId = cartId;
        this.cartItemId = cartItemId;
        this.seatId = seatId;
        this.price = price;
        this.heldUntil = heldUntil;
    }

    public static CartResponse from(CartItemEntity entity) {
        return new CartResponse(
                entity.getId(),
                entity.getCart().getId(),
                entity.getSeat().getId(),
                entity.getSeat().getPrice(),
                entity.getSeat().getHeldUntil()
        );
    }
}
