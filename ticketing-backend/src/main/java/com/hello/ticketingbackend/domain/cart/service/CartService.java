package com.hello.ticketingbackend.domain.cart.service;

import com.hello.ticketingbackend.domain.cart.dto.CartRequest;
import com.hello.ticketingbackend.domain.cart.dto.CartResponse;
import com.hello.ticketingbackend.domain.cart.entity.CartEntity;
import com.hello.ticketingbackend.domain.cart.entity.CartItemEntity;
import com.hello.ticketingbackend.domain.cart.repository.CartRepository;
import com.hello.ticketingbackend.domain.seat.dto.SeatStatus;
import com.hello.ticketingbackend.domain.seat.entity.SeatEntity;
import com.hello.ticketingbackend.domain.seat.repository.SeatRepository;
import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import com.hello.ticketingbackend.domain.user.repository.UserRepository;
import com.hello.ticketingbackend.exception.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final SeatRepository seatRepository;
    @Transactional
    public Long addItem(CartRequest request,String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));

        CartEntity cart = cartRepository.findByuserId(user.getId())
                .orElseGet(() -> CartEntity.createCart(user));

        SeatEntity seat = seatRepository.findById(request.getSeatId())
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));

        cart.addItem(seat);

        return cartRepository.save(cart).getId();
    }
    @Transactional
    public List<CartResponse> readItems(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));
        CartEntity cart = cartRepository.findByuserId(user.getId())
                .orElseGet(() -> CartEntity.createCart(user));
        List<CartItemEntity> cartItems = cart.getCartItemEntities();

        return cartItems.stream().map(CartResponse::from).toList();
    }

    @Transactional
    public void deleteItem(CartRequest request, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));
        CartEntity cart = cartRepository.findByuserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));
        SeatEntity seat = seatRepository.findById(request.getSeatId())
                .orElseThrow(() -> new EntityNotFoundException("entity를 찾을 수 없습니다."));

        cart.removeItem(seat.getId());
        cartRepository.save(cart); // 삭제예정
    }

}
