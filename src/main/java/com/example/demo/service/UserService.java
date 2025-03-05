package com.example.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final Random random = new Random();

	private static final List<String> ADJECTIVES = List.of(
			"Swift", "Clever", "Brave", "Happy", "Mighty", "Fierce", "Gentle", "Lucky", "Quiet", "Loyal",
			"Bold", "Daring", "Jolly", "Rapid", "Sneaky", "Witty", "Sharp", "Vivid", "Shiny", "Charming",
			"Calm", "Glorious", "Spirited", "Radiant", "Dazzling", "Fearless", "Elegant", "Cunning", "Nimble",
			"Energetic",
			"Thunderous", "Blazing", "Daring", "Frosty", "Sizzling", "Stormy", "Cheerful", "Vibrant", "Serene", "Wild",
			"Brilliant", "Mystic", "Snappy", "Dashing", "Whimsical", "Sunny", "Luminous", "Tenacious", "Resilient",
			"Miraculous");

	private static final List<String> ANIMALS = List.of(
			"Tiger", "Fox", "Wolf", "Eagle", "Panda", "Lion", "Hawk", "Rabbit", "Bear", "Deer",
			"Jaguar", "Otter", "Falcon", "Shark", "Koala", "Cheetah", "Lynx", "Orca", "Badger", "Bison",
			"Moose", "Gorilla", "Panther", "Turtle", "Owl", "Cobra", "Lizard", "Hyena", "Penguin", "Viper",
			"Scorpion", "Dolphin", "Mongoose", "Chameleon", "Peacock", "Leopard", "Wolverine", "Albatross", "Coyote",
			"Hedgehog",
			"Armadillo", "Octopus", "Salamander", "Meerkat", "Gazelle", "Raven", "Swan", "Beaver", "Kangaroo",
			"Giraffe");

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
		user.setPassword(passwordEncoder.encode(password));
		return userRepository.save(user);
	}

	@Transactional
	public User save(User user) {
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

		// 4桁のゼロ埋め
		String formattedNumber = String.format("%04d", number);

		return adjective + animal + formattedNumber;
	}
}
