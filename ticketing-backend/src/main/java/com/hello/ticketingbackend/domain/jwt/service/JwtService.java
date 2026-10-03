package com.hello.ticketingbackend.domain.jwt.service;

import com.hello.ticketingbackend.domain.jwt.dto.JwtResponseDTO;
import com.hello.ticketingbackend.domain.jwt.dto.RefreshRequestDTO;
import com.hello.ticketingbackend.domain.jwt.entity.RefreshEntity;
import com.hello.ticketingbackend.domain.jwt.repository.RefreshRepository;
import com.hello.ticketingbackend.util.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final RefreshRepository refreshRepository;

    @Transactional
    public void addRefresh(String username, String refreshToken) {
        RefreshEntity entity = RefreshEntity.builder()
                .username(username)
                .refresh(refreshToken)
                .build();

        refreshRepository.save(entity);
    }
    @Transactional
    public Boolean existsRefresh(String refreshToken) {
        return refreshRepository.existsByRefresh(refreshToken);
    }

    @Transactional
    public void removeRefresh(String refreshToken) {
        refreshRepository.deleteByRefresh(refreshToken);
    }

    @Transactional
    public JwtResponseDTO cookie2Header(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            throw new RuntimeException("쿠키가 존재하지 않습니다");
        }

        String refreshToken = null;
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("refreshToken")) {
                refreshToken = cookie.getValue();
                break;
            }
        }

        if (refreshToken == null) {
            throw new RuntimeException("refreshToken 존재하지 않습니다");
        }

        Boolean isValid = JwtUtil.isValid(refreshToken, false);
        if (!isValid) {
            throw new RuntimeException("유효하지 않은 refreshToken 입니다");
        }

        String username = JwtUtil.getUsername(refreshToken);
        String role = JwtUtil.getRole(refreshToken);

        String newAccessToken = JwtUtil.createJWT(username, role, true);
        String newRefreshToken = JwtUtil.createJWT(username, role, false);

        RefreshEntity newRefreshEntity = RefreshEntity.builder()
                .username(username)
                .refresh(newRefreshToken)
                .build();

        removeRefresh(refreshToken);
        refreshRepository.flush();
        refreshRepository.save(newRefreshEntity);

        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(10);
        response.addCookie(refreshCookie);

        return new JwtResponseDTO(newAccessToken, newRefreshToken);
    }

    @Transactional
    public JwtResponseDTO refreshRotate(RefreshRequestDTO dto) {

        String refreshToken = dto.getRefreshToken();
        System.out.println("refresh="+refreshToken);

        Boolean isValid = JwtUtil.isValid(refreshToken,false);
        if (!isValid) {
            throw new RuntimeException("유효하지 않은 refreshToken 입니다");
        }

        String username = JwtUtil.getUsername(refreshToken);
        String role = JwtUtil.getRole(refreshToken);

        String newAccessToken = JwtUtil.createJWT(username, role, true);
        String newRefreshToken = JwtUtil.createJWT(username, role, false);

        RefreshEntity newRefreshEntity = RefreshEntity.builder()
                .username(username)
                .refresh(newRefreshToken)
                .build();

        removeRefresh(refreshToken);
        refreshRepository.flush();
        refreshRepository.save(newRefreshEntity);

        return new JwtResponseDTO(newAccessToken, newRefreshToken);
    }
}
