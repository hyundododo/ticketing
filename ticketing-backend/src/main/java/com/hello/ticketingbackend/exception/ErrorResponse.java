package com.hello.ticketingbackend.exception;

import lombok.Getter;

import java.time.LocalDateTime;

public class ErrorResponse {
    private String message;
    private LocalDateTime localDateTime;

    public ErrorResponse(String message, LocalDateTime localDateTime) {
        this.message = message;
        this.localDateTime = localDateTime;
    }

    public static ErrorResponse of(String message) {
        return new ErrorResponse(message, LocalDateTime.now());
    }
}
