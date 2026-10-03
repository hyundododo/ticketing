package com.hello.ticketingbackend.domain.concert.repository;

import com.hello.ticketingbackend.domain.concert.entity.ConcertEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConcertRepository extends JpaRepository<ConcertEntity,Long> {
}
