package com.hello.ticketingbackend.domain.jwt.repository;

import com.hello.ticketingbackend.domain.jwt.entity.RefreshEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface RefreshRepository extends JpaRepository<RefreshEntity,Long> {

    Boolean existsByRefresh(String refresh);

    void deleteByRefresh(String refresh);

    void deleteByCreatedDateBefore(LocalDateTime createdDateBefore);
}
