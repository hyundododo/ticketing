package com.hello.ticketingbackend.controller;

import com.hello.ticketingbackend.domain.jwt.dto.JwtResponseDTO;
import com.hello.ticketingbackend.domain.jwt.dto.RefreshRequestDTO;
import com.hello.ticketingbackend.domain.jwt.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class JwtController {

    private final JwtService jwtService;

    @PostMapping(value = "/jwt/exchange", consumes = MediaType.APPLICATION_JSON_VALUE)
    public JwtResponseDTO jwtExchangeApi(HttpServletRequest request, HttpServletResponse response) {
        return jwtService.cookie2Header(request, response);
    }

    @PostMapping(value = "/jwt/refresh", consumes = MediaType.APPLICATION_JSON_VALUE)
    public JwtResponseDTO jwtRefreshApi(@Validated @RequestBody RefreshRequestDTO dto) {
        return jwtService.refreshRotate(dto);
    }

}
