package com.hello.ticketingbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableJpaAuditing
@EntityScan(basePackages = "com.hello.ticketingbackend")
public class TicketingBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TicketingBackendApplication.class, args);
    }

}
