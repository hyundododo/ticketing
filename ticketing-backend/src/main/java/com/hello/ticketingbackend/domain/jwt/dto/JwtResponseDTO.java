package com.hello.ticketingbackend.domain.jwt.dto;

public record JwtResponseDTO(
        String accessToken, String refreshToken
) {
}
