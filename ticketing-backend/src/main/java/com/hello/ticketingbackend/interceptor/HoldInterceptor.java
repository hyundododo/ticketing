package com.hello.ticketingbackend.interceptor;

import com.hello.ticketingbackend.domain.waiting.service.WaitingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class HoldInterceptor implements HandlerInterceptor {

    private final WaitingService waitingService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        if (CorsUtils.isPreFlightRequest(request)) {
            return true;
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof AnonymousAuthenticationToken || authentication == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":\"LOGIN_REQUIRED\",\"message\":\"사용자를 찾을 수 없습니다.\"}");
            return false;
        }

        String userId = authentication.getName();

        if (waitingService.isAllowed(userId)) {
            return true;
        } else {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":\"QUEUE_TOKEN_REQUIRED\",\"message\":\"토큰이 없습니다.\"}");
            return false;
        }
    }
}
