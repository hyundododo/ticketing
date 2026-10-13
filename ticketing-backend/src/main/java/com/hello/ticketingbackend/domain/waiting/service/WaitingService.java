package com.hello.ticketingbackend.domain.waiting.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class WaitingService {
    private final StringRedisTemplate redisTemplate;
    private static final String QUEUE_KEY = "waiting_queue";
    private static final String ALLOWED_KEY = "allowed_users";
    private static final long ALLOW_TTL_SECONDS = 60;

    public WaitingService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void enqueue(String userId) {
        redisTemplate.opsForList().leftPush(QUEUE_KEY, userId);
    }

    public String dequeue() {
        return redisTemplate.opsForList().rightPop(QUEUE_KEY);
    }

    public long getQueueSize() {
        return redisTemplate.opsForList().size(QUEUE_KEY);
    }

    public void allowUser(String userId) {
        redisTemplate.opsForSet().add(ALLOWED_KEY, userId);
        redisTemplate.expire(ALLOWED_KEY, Duration.ofSeconds(ALLOW_TTL_SECONDS));
    }

    public boolean isAllowed(String userId) {
        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(ALLOWED_KEY, userId));
    }
}
