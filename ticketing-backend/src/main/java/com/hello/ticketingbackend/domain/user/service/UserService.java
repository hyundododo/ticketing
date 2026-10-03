package com.hello.ticketingbackend.domain.user.service;

import com.hello.ticketingbackend.domain.jwt.service.JwtService;
import com.hello.ticketingbackend.domain.user.dto.UserRequestDTO;
import com.hello.ticketingbackend.domain.user.dto.UserResponseDTO;
import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import com.hello.ticketingbackend.domain.user.entity.UserRoleType;
import com.hello.ticketingbackend.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Transactional
    public Boolean existUser(UserRequestDTO dto) {
        return userRepository.existsByUsername(dto.getUsername());
    }

    @Transactional
    public Long findByUsername(String username) {
        return userRepository.findByUsername(username).get().getId();
    }


    @Transactional
    public Long addUser(UserRequestDTO dto) {

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("이미 존재하는 회원입니다");
        }

        UserEntity entity = UserEntity.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .isSocial(false)
                .roleType(UserRoleType.USER)
                .nickname(dto.getNickname())
                .email(dto.getEmail())
                .build();

        return userRepository.save(entity).getId();
    }

    @Transactional
    public Long updateUser(UserRequestDTO dto) throws AccessDeniedException {

        String sessionUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        if (!sessionUsername.equals(dto.getUsername())) {
            throw new AccessDeniedException("본인 계정만 수정가능");
        }

        UserEntity entity = userRepository.findByUsernameAndIsSocial(dto.getUsername(), false)
                .orElseThrow(() -> new UsernameNotFoundException(dto.getUsername()));

        entity.updateUser(dto);

        return userRepository.save(entity).getId();
    }

    @Transactional
    public void deleteUser(UserRequestDTO dto) throws AccessDeniedException {
        SecurityContext context = SecurityContextHolder.getContext();
        String sessionUsername = context.getAuthentication().getName();
        String sessionRole = context.getAuthentication().getAuthorities().iterator().next().getAuthority();

        boolean isOwner = sessionUsername.equals(dto.getUsername());
        boolean isAdmin = sessionRole.equals("ROLE_" + UserRoleType.ADMIN.name());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("본인 혹인 관리자만 삭제할 수 있습니다");
        }

        userRepository.deleteByUsername(dto.getUsername());
        jwtService.removeRefresh(dto.getUsername());
    }

    @Transactional
    public UserResponseDTO readUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        UserEntity entity = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("해당 유저를 찾을 수 없습니다: " + username));

        return new UserResponseDTO(username, entity.getIsSocial(), entity.getNickname(), entity.getEmail());
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity entity = userRepository.findByUsernameAndIsSocial(username, false)
                .orElseThrow(() -> new UsernameNotFoundException("본인 계정만 접근 가능"));

        return User.builder()
                .username(entity.getUsername())
                .password(entity.getPassword())
                .roles(entity.getRoleType().name())
                .build();
    }
}
