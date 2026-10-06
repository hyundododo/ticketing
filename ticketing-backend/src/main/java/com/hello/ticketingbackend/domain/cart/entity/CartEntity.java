package com.hello.ticketingbackend.domain.cart.entity;

import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CartEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItemEntity> cartItemEntities = new ArrayList<>();

    public static CartEntity createCart(UserEntity user) {
        CartEntity cart = new CartEntity();
        cart.setUser(user);
        return cart;
    }

    public void addItem(SeatEntity seat) {
        this.cartItemEntities.add(new CartItemEntity(this, seat));
    }

    public void removeItem(Long seatId) {
        this.cartItemEntities.removeIf(item -> item.getSeat().getId().equals(seatId));
    }

}
