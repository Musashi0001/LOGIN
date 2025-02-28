package com.example.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final Random random = new Random();

	private static final List<String> ADJECTIVES = List.of("Swift", "Clever", "Brave", "Happy", "Mighty", "Fierce",
			"Gentle", "Lucky", "Quiet", "Loyal");
	private static final List<String> ANIMALS = List.of("Tiger", "Fox", "Wolf", "Eagle", "Panda", "Lion", "Hawk",
			"Rabbit", "Bear", "Deer");

	public Optional<User> findByUsername(String username) {
		return userRepository.findByUsername(username);
	}

	public Optional<User> findByEmail(String email) {
		return userRepository.findByEmail(email);
	}

	public Optional<User> findByEmailOrUsername(String identifier) {
	    Optional<User> userByEmail = userRepository.findByEmail(identifier);
	    if (userByEmail.isPresent()) {
	        return userByEmail;
	    }
	    return userRepository.findByUsername(identifier);
	}

	public User registerUser(String username, String email, String password) {
		User user = new User();
		user.setUsername(username);
		user.setEmail(email);
		user.setPassword(passwordEncoder.encode(password)); // ハッシュ化
		return userRepository.save(user);
	}

	public String generateUniqueUsername() {
		String username;
		do {
			username = generateRandomUsername();
		} while (userRepository.findByUsername(username).isPresent());
		return username;
	}

	private String generateRandomUsername() {
		String adjective = ADJECTIVES.get(random.nextInt(ADJECTIVES.size()));
		String animal = ANIMALS.get(random.nextInt(ANIMALS.size()));
		int number = random.nextInt(10000); // 0000～9999

		// 数字部分を4桁のゼロ埋めにする
		String formattedNumber = String.format("%04d", number);

		return adjective + animal + formattedNumber;
	}

}
