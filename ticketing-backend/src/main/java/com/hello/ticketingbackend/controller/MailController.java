package com.hello.ticketingbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MailController {

    private final JavaMailSender mailSender;

    @GetMapping("/mail/{userId}")
    public String sendMail(@PathVariable Long userId) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("guseh3742@gmail.com");
        message.setFrom("guseh3742@naver.com");

        message.setSubject("[ticketing] 예매완료 안내 메일입니다.");
        message.setText("예매가 완료되었습니다.");

        mailSender.send(message);
        return "ok";
    }
}
