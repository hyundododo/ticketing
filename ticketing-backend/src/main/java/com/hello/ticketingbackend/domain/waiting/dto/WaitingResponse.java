package com.hello.ticketingbackend.domain.waiting.dto;

public record WaitingResponse (
        WaitingStatus status,
        Long rank
){

    public static WaitingResponse allowed() {
        return new WaitingResponse(WaitingStatus.ALLOWED, null);
    }
    public static WaitingResponse waiting(Long rank) {
        return new WaitingResponse(WaitingStatus.WAITING, rank);
    }
    public static WaitingResponse none() {
        return new WaitingResponse(WaitingStatus.NONE, null);
    }
}
