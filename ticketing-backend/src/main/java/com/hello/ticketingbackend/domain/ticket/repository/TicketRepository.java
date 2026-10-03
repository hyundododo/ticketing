package com.hello.ticketingbackend.domain.ticket.repository;

import com.hello.ticketingbackend.domain.ticket.entity.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<TicketEntity,Long> {
}
