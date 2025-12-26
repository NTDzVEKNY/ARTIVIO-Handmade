package com.artivio.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.regex.Pattern;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider; // Injecting from a separate config is safer

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults()) // Enable CORS based on the Bean below
                .authorizeHttpRequests(auth -> auth
                        // === PUBLIC ENDPOINTS ===
                        .requestMatchers("/api/login", "/api/register", "/api/verifyAccount", "/api/forgot-password",
                                "/api/reset-password").permitAll()

                        // Public GET resources
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/category/**").permitAll()

                        // Allow order creation without authentication (guest checkout)
                        .requestMatchers(HttpMethod.POST, "/api/orders/create").permitAll()
                        // Allow order details retrieval by numeric ID without authentication (for guest checkout success page)
                        // This custom matcher only matches numeric IDs, not endpoints like /my-orders or /custom-progress
                        .requestMatchers(request -> {
                            if (request.getMethod().equals("GET") && request.getRequestURI().startsWith("/api/orders/")) {
                                String pathSegment = request.getRequestURI().substring("/api/orders/".length());
                                // Check if the path segment is a numeric ID (not a named endpoint)
                                return Pattern.matches("^\\d+$", pathSegment);
                            }
                            return false;
                        }).permitAll()

                        // WebSocket (Note: Check specific WS security in WebSocketConfig)
                        .requestMatchers("/api/chat/**", "/ws/**", "/ws-raw/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // Swagger UI (Optional, but usually needed)
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()

                        // === SECURED ENDPOINTS ===
                        // Example: Only ADMIN can delete products
                        // .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // === CORS CONFIGURATION ===
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow specific origins (Replace "*" with your frontend URL in production)
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}