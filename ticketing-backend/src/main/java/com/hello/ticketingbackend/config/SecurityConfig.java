package com.hello.ticketingbackend.config;

import com.hello.ticketingbackend.domain.jwt.service.JwtService;
import com.hello.ticketingbackend.domain.user.entity.UserRoleType;
import com.hello.ticketingbackend.fillter.JwtFilter;
import com.hello.ticketingbackend.fillter.LoginFilter;
import com.hello.ticketingbackend.handler.LoginSuccessHandler;
import com.hello.ticketingbackend.handler.RefreshTokenLogoutHandler;
import com.hello.ticketingbackend.handler.SocialSuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@Slf4j
public class SecurityConfig {

    private final LoginSuccessHandler loginSuccessHandler;
    private final SocialSuccessHandler socialSuccessHandler;
    private final JwtService jwtService;
    private final AuthenticationConfiguration authenticationConfiguration;

    public SecurityConfig(@Qualifier("LoginSuccessHandler") LoginSuccessHandler loginSuccessHandler,
                          @Qualifier("SocialSuccessHandler") SocialSuccessHandler socialSuccessHandler,
                          JwtService jwtService,
                          AuthenticationConfiguration authenticationConfiguration) {
        this.loginSuccessHandler = loginSuccessHandler;
        this.socialSuccessHandler = socialSuccessHandler;
        this.jwtService = jwtService;
        this.authenticationConfiguration = authenticationConfiguration;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.withRolePrefix("ROLE_")
                .role(UserRoleType.ADMIN.name()).implies(UserRoleType.USER.name()).build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http
                .cors(AbstractHttpConfigurer::disable);
        http
                .httpBasic(AbstractHttpConfigurer::disable);
        http
                .formLogin(AbstractHttpConfigurer::disable);
        http
                .csrf(AbstractHttpConfigurer::disable);

        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/jwt/exchange", "/jwt/refresh",
                                "/swagger-ui/**","/swagger-ui.html","/v3/api-docs/**","/v3/api-docs.yaml").permitAll()
                        .requestMatchers(HttpMethod.POST, "/user/exist", "/user").permitAll()
                        .requestMatchers(HttpMethod.GET, "/user").hasRole(UserRoleType.USER.name())
                        .requestMatchers(HttpMethod.PUT, "/user").hasRole(UserRoleType.USER.name())
                        .requestMatchers(HttpMethod.DELETE, "/user").hasRole(UserRoleType.USER.name())
                        .anyRequest().authenticated());

        http
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(socialSuccessHandler));

        http
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((request, response, authException) -> {
                            log.warn("401 uri={}, dispatcher={}, auth={}, ex={}",
                                    request.getRequestURI(),
                                    request.getDispatcherType(),
                                    SecurityContextHolder.getContext().getAuthentication(),
                                    authException.toString());
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                        })
                        .accessDeniedHandler((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_FORBIDDEN); // 403 응답
                        })
                );

        http
                .addFilterBefore(new LoginFilter(authenticationManager(authenticationConfiguration), loginSuccessHandler), UsernamePasswordAuthenticationFilter.class);
        http
                .logout(logout -> logout
                        .addLogoutHandler(new RefreshTokenLogoutHandler(jwtService)));

        http
                .addFilterBefore(new JwtFilter(), LogoutFilter.class);

        http
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));



        return http.build();
    }

}
