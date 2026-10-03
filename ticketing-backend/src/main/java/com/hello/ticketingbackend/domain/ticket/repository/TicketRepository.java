package com.hello.ticketingbackend.domain.ticket.repository;

import com.hello.ticketingbackend.domain.ticket.entity.TicketEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<TicketEntity,Long> {

    List<TicketEntity> findByuserId(Long userId);
}
