package com.hello.ticketingbackend.domain.cart.dto;

import com.hello.ticketingbackend.domain.cart.entity.CartEntity;
import com.hello.ticketingbackend.domain.cart.entity.CartItemEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
@AllArgsConstructor
public class CartResponse {

    private Long id;
    private Long cartId;
    private Long cartItemId;
    private Long seatId;

    public CartResponse(Long cartId, Long cartItemId, Long seatId) {
        this.cartId = cartId;
        this.cartItemId = cartItemId;
        this.seatId = seatId;
    }

    public static CartResponse from(CartItemEntity entity) {
        return new CartResponse(
                entity.getId(),
                entity.getCart().getId(),
                entity.getSeat().getId()
        );
    }
}
