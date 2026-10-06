package com.hello.ticketingbackend.domain.user.service;

import com.hello.ticketingbackend.domain.jwt.service.JwtService;
import com.hello.ticketingbackend.domain.user.dto.CustomOAuth2User;
import com.hello.ticketingbackend.domain.user.dto.UserRequestDTO;
import com.hello.ticketingbackend.domain.user.dto.UserResponseDTO;
import com.hello.ticketingbackend.domain.user.entity.SocialProviderType;
import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import com.hello.ticketingbackend.domain.user.entity.UserRoleType;
import com.hello.ticketingbackend.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService extends DefaultOAuth2UserService implements UserDetailsService {

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

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes;
        List<GrantedAuthority> authorities;

        String username;
        String role = UserRoleType.USER.name();
        String email = null;
        String nickname;

        String registrationId = userRequest.getClientRegistration().getRegistrationId().toUpperCase();
        if (registrationId.equals(SocialProviderType.NAVER.name())) {
            attributes = (Map<String, Object>) oAuth2User.getAttributes().get("response");
            username = registrationId + "_" + attributes.get("id");
            email = attributes.get("email").toString();
            nickname = attributes.get("nickname").toString();
        } else if (registrationId.equals(SocialProviderType.GOOGLE.name())) {
            attributes = oAuth2User.getAttributes();
            username = registrationId + "_" + attributes.get("sub");
            email = attributes.get("email").toString();
            nickname = attributes.get("name").toString();
        } else {
            throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인 입니다");
        }

        Optional<UserEntity> entity = userRepository.findByUsernameAndIsSocial(username, true);
        if (entity.isPresent()) {
            role = entity.get().getRoleType().name();

            UserRequestDTO dto = new UserRequestDTO();
            dto.setNickname(nickname);
            dto.setEmail(email);
            entity.get().updateUser(dto);

            userRepository.save(entity.get());
        } else {
            UserEntity newUserEntity = UserEntity.builder()
                    .username(username)
                    .password("")
                    .email(email)
                    .isSocial(true)
                    .socialProviderType(SocialProviderType.valueOf(registrationId))
                    .roleType(UserRoleType.USER)
                    .nickname(nickname)
                    .build();

            userRepository.save(newUserEntity);
        }
        authorities = List.of(new SimpleGrantedAuthority(role));

        return new CustomOAuth2User(attributes, authorities, username);
    }
}
