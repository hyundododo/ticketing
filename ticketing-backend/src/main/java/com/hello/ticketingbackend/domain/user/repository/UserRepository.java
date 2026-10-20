package com.hello.ticketingbackend.domain.user.repository;

import com.hello.ticketingbackend.domain.user.entity.UserEntity;
import com.hello.ticketingbackend.domain.user.entity.UserRoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity,Long> {
    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByUsernameAndIsSocial(String username, Boolean isSocial);

    Boolean existsByUsername(String username);

    void deleteByUsername(String username);

    Boolean existsByRoleType(UserRoleType roleType);
}
