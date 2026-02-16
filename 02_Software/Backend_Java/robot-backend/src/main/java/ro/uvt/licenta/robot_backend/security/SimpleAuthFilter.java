package ro.uvt.licenta.robot_backend.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ro.uvt.licenta.robot_backend.model.User;
import ro.uvt.licenta.robot_backend.repository.UserRepository;

import java.io.IOException;
import java.util.Base64;
import java.util.Collections;
import java.util.Optional;

@Component
public class SimpleAuthFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SimpleAuthFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();
        if (uri.startsWith("/api/auth/") ||
                uri.startsWith("/api/game/") ||
                uri.startsWith("/api/sessions/") ||
                uri.startsWith("/ws_game")) {

            System.out.println("Public/Bypass: " + method + " " + uri);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ") ||
                authHeader.contains("null") || authHeader.contains("undefined")) {

            System.out.println("Lipsă token pe rută protejată: " + uri);
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
            String[] parts = token.split("\\.");

            if (parts.length >= 2) {
                String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));
                JsonNode jsonNode = objectMapper.readTree(payloadJson);

                if (jsonNode.has("sub")) {
                    String email = jsonNode.get("sub").asText();
                    Optional<User> userOp = userRepository.findByEmail(email);

                    if (userOp.isPresent()) {
                        User user = userOp.get();

                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()))
                        );

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);

                        System.out.println("Autentificat: " + email + " [" + user.getRole() + "]");
                    }
                }
            }
        } catch (Exception e) {
            System.out.println(" Eroare decodare: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}