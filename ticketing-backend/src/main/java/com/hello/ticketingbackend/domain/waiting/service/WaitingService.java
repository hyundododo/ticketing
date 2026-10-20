package com.hello.ticketingbackend.domain.waiting.service;

import org.jspecify.annotations.NonNull;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class WaitingService {
    private final StringRedisTemplate redisTemplate;
    private static final String QUEUE_KEY = "waiting_queue";
    private static final long ALLOW_TTL_SECONDS = 300; // 실제 서비스에서는 3~5분 정도

    public WaitingService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void enqueue(String userId) {
        redisTemplate.opsForZSet().addIfAbsent(QUEUE_KEY, userId, System.currentTimeMillis());
    }

    public Long leave(String userId) {
        return redisTemplate.opsForZSet().remove(QUEUE_KEY, userId);
    }

    public Long getQueueSize() {
        return redisTemplate.opsForZSet().zCard(QUEUE_KEY);
    }

    public Long rank(String userId) {
        Long rank = redisTemplate.opsForZSet().rank(QUEUE_KEY, userId);
        if (rank == null) {
            return null;
        }
        return ++rank;
    }

    public List<String> popMin(int count) {
        Set<ZSetOperations.@NonNull TypedTuple<String>> tupleSet = redisTemplate.opsForZSet().popMin(QUEUE_KEY, count);

        if (tupleSet == null) {
            return List.of();
        }

        return tupleSet.stream()
                .map(ZSetOperations.TypedTuple::getValue)
                .filter(Objects::nonNull)
                .toList();
    }

    private String entryKey(String userId) {
        return "entry:" + userId;
    }

    public void allowUser(String userId) {
        redisTemplate.opsForValue().set(entryKey(userId),
                "1",Duration.ofSeconds(ALLOW_TTL_SECONDS));
    }

    public boolean isAllowed(String userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(entryKey(userId)));
    }

}
