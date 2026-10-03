package com.hello.ticketingbackend.domain.concert.repository;

import com.hello.ticketingbackend.domain.concert.dto.ConcertResponse;
import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConcertRepository extends JpaRepository<ConcertEntity,Long> {
}
