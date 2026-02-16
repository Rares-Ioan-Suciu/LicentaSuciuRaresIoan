package ro.uvt.licenta.robot_backend.server.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import ro.uvt.licenta.robot_backend.model.User;
import ro.uvt.licenta.robot_backend.payload.LoginRequest;
import ro.uvt.licenta.robot_backend.payload.RegisterRequest;
import ro.uvt.licenta.robot_backend.repository.UserRepository;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email-ul se află deja în baza de date!"));
        }

        User user = new User(
                registerRequest.getFullName(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getRole());

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Contul a fost creat cu succes!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        System.out.println("--- LOGIN REQUEST: " + loginRequest.getEmail() + " ---");

        Optional<User> userOp = userRepository.findByEmail(loginRequest.getEmail());

        if (userOp.isPresent()) {
            User user = userOp.get();

            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                String jsonPayload = "{" +
                        "\"sub\": \"" + user.getEmail() + "\", " +
                        "\"role\": \"" + user.getRole() + "\", " +
                        "\"full_name\": \"" + user.getFullName() + "\", " +
                        "\"id\": \"" + user.getId() + "\"" +
                        "}";

                String encodedPayload = Base64.getEncoder().encodeToString(jsonPayload.getBytes());


                String mockJwtToken = "eyJhbGciOiJIUzI1NiJ9." + encodedPayload + ".SemnaturaFalsaDoarPentruTest";

                Map<String, String> response = new HashMap<>();
                response.put("access_token", mockJwtToken);

                System.out.println("LOGIN SUCCESS! Token generat: " + mockJwtToken);
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.badRequest().body(Map.of("detail", "Email sau parolă incorectă"));
    }
}