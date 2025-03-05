package com.example.demo.controller;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class ForgotPasswordController {
    private final UserService userService;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    
    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();

    @PostMapping("/forgot-password")
    public ResponseEntity<String> sendVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userService.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("このメールアドレスは登録されていません");
        }

        String code = generateVerificationCode();
        verificationCodes.put(email, code);

        try {
            sendEmail(email, code);
            return ResponseEntity.ok("認証コードを送信しました");
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("メール送信に失敗しました");
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        
        if (verificationCodes.containsKey(email) && verificationCodes.get(email).equals(code)) {
            verificationCodes.remove(email);
            return ResponseEntity.ok("認証コードが確認されました");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("認証コードが正しくありません");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("password");

        User user = userService.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ユーザーが見つかりません");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userService.save(user);
        return ResponseEntity.ok("パスワードがリセットされました");
    }

    private String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private void sendEmail(String to, String code) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("パスワードリセット認証コード");
        helper.setText("認証コード: " + code);
        mailSender.send(message);
    }
}
