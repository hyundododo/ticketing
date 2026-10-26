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

    public void enqueue(String concertId, String userId) {
        redisTemplate.opsForZSet().addIfAbsent(concertId, userId, System.currentTimeMillis());
    }

    public Long leave(String concertId, String userId) {
        return redisTemplate.opsForZSet().remove(concertId, userId);
    }

    public Long getQueueSize(String concertId) {
        return redisTemplate.opsForZSet().zCard(concertId);
    }

    public Long rank(String concertId, String userId) {
        Long rank = redisTemplate.opsForZSet().rank(concertId, userId);
        if (rank == null) {
            return null;
        }
        return ++rank;
    }

    public List<String> popMin(String concertId, int count) {
        Set<ZSetOperations.@NonNull TypedTuple<String>> tupleSet =
                redisTemplate.opsForZSet().popMin(concertId, count);

        if (tupleSet == null) {
            return List.of();
        }

        return tupleSet.stream()
                .map(ZSetOperations.TypedTuple::getValue)
                .filter(Objects::nonNull)
                .toList();
    }

    private String entryKey(String concertId, String userId) {
        return "entry:" + concertId + ":" + userId;
    }

    public void allowUser(String concertId,String userId) {
        redisTemplate.opsForValue().set(entryKey(concertId,userId),
                "1",Duration.ofSeconds(ALLOW_TTL_SECONDS));
    }

    public boolean isAllowed(String concertId,String userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(entryKey(concertId,userId)));
    }

}
