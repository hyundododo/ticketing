package com.hello.ticketingbackend.handler;

import com.hello.ticketingbackend.domain.jwt.service.JwtService;
import com.hello.ticketingbackend.util.JwtUtil;
import io.jsonwebtoken.Jwt;
import jakarta.annotation.Nullable;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.util.StringUtils;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

@RequiredArgsConstructor
public class RefreshTokenLogoutHandler implements LogoutHandler {
    private final JwtService jwtService;

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, @Nullable Authentication authentication) {
        try {
            String body = new BufferedReader(new InputStreamReader(request.getInputStream()))
                    .lines().reduce("", String::concat);
            if (!StringUtils.hasText(body)) return;

            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(body);
            String refreshToken = jsonNode.has("refreshToken") ? jsonNode.get("refreshToken").asString() : null;

            if (refreshToken == null) {
                return;
            }
            Boolean isValid = JwtUtil.isValid(refreshToken, false);
            if (!isValid) {
                return;
            }

            jwtService.removeRefresh(refreshToken);
        } catch (IOException e) {
            throw new RuntimeException("Faild to read RefreshToken");
        }
    }
}
