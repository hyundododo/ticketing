package com.hello.ticketingbackend.config;

import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import com.hello.ticketingbackend.domain.user.entity.UserRoleType;
import com.hello.ticketingbackend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootStrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${bootstrap.admin.username}")
    private String username;
    @Value("${bootstrap.admin.password}")
    private String password;
    @Value("${bootstrap.admin.nickname}")
    private String nickname;
    @Value("${bootstrap.admin.email}")
    private String email;


    @Override
    public void run(ApplicationArguments args) throws Exception {

        if (userRepository.existsByRoleType(UserRoleType.ADMIN)) {
            return;
        }

        UserEntity admin = UserEntity.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .isSocial(false)
                .roleType(UserRoleType.ADMIN)
                .nickname(nickname)
                .email(email)
                .build();

        userRepository.save(admin);
        log.info("최초 관리자 계정 생성 완료 = {}", username);
    }
}
