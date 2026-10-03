package com.hello.ticketingbackend.domain.user.entity;

import com.hello.ticketingbackend.domain.user.dto.UserRequestDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;
    private String password;
    @Column(nullable = false)
    private String nickname;
    @Email
    private String email;
    @Enumerated(EnumType.STRING)
    private SocialProviderType socialProviderType;
    private Boolean isSocial;
    @Enumerated(EnumType.STRING)
    private UserRoleType roleType;
    @CreatedDate
    private LocalDateTime createdDate;
    @LastModifiedDate
    private LocalDateTime updatedDate;
    public UserEntity(String username, String nickname) {
        this.username = username;
        this.nickname = nickname;
    }

    public void updateUser(UserRequestDTO dto) {
        this.email = dto.getEmail();
        this.nickname = dto.getNickname();
    }
}
