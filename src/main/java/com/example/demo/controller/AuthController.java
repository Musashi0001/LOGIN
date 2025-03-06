package com.example.demo.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
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
public class AuthController {
	private final UserService userService;
	private final PasswordEncoder passwordEncoder;

	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestBody Map<String, String> credentials, HttpSession session) {
		String identifier = credentials.get("identifier"); // ユーザー名 or メールアドレス
		String password = credentials.get("password");

		Optional<User> userOpt = userService.findByEmailOrUsername(identifier);
		if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
			session.setAttribute("user", userOpt.get());
			return ResponseEntity.ok("ログイン成功");
		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("ユーザー名またはメールアドレス、またはパスワードが間違っています");
	}

	@PostMapping("/register")
	public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> userData) {
		String username = userData.get("username");
		String email = userData.get("email");
		String password = userData.get("password");
		String confirmPassword = userData.get("confirmPassword"); // 確認用パスワード

		List<String> errors = new ArrayList<>();

		if (userService.findByEmail(email).isPresent()) {
			errors.add("このメールアドレスは既に登録されています");
		}

		if (userService.findByUsername(username).isPresent()) {
			errors.add("このユーザー名は既に使用されています");
		}

		if (!isValidPassword(password)) {
			errors.add("パスワードは8文字以上で英数字大文字小文字をそれぞれ含む必要があります");
		}

		if (!password.equals(confirmPassword)) {
			errors.add("パスワードが一致しません");
		}

		if (!errors.isEmpty()) {
			Map<String, Object> response = new HashMap<>();
			response.put("errors", errors);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		}

		userService.registerUser(username, email, password);
		return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "ユーザー登録が完了しました"));
	}

	// パスワードの形式チェックメソッド
	private boolean isValidPassword(String password) {
		return password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$");
	}

	@GetMapping("/generate-username")
	public ResponseEntity<Map<String, String>> generateUsername() {
		String username = userService.generateUniqueUsername();
		return ResponseEntity.ok(Map.of("username", username));
	}

	@GetMapping("/me")
	public ResponseEntity<?> getUser(HttpSession session) {
		User user = (User) session.getAttribute("user");
		return user != null ? ResponseEntity.ok(user) : ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("未認証");
	}

	@PostMapping("/logout")
	public ResponseEntity<String> logout(HttpSession session) {
		session.invalidate();
		return ResponseEntity.ok("ログアウト成功");
	}
}
