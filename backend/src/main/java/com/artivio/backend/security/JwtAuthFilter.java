package com.artivio.backend.security;

import com.artivio.backend.modules.auth.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; // Bean này đã tạo trong SecurityConfig

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Bỏ qua /api/login vì đây là API để lấy token, không cần check
        if (request.getServletPath().contains("/api/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Lấy header Authorization
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Kiểm tra xem header có tồn tại và có 'Bearer ' không
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return; // Không có token, cho qua (SecurityConfig sẽ chặn sau)
        }

        // Tách lấy phần token (bỏ "Bearer ")
        jwt = authHeader.substring(7);

        try {
            // Trích xuất email từ token
            userEmail = jwtService.extractUsername(jwt);

            // Kiểm tra xem userEmail có tồn tại và đã được xác thực chưa
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Tải thông tin User (User.java) từ database
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // Kiểm tra token có hợp lệ không
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Nếu token hợp lệ, tạo 1 đối tượng xác thực
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // Không cần credentials (password)
                            userDetails.getAuthorities() // Quyền (CUSTOMER/ARTISAN)
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // Cập nhật SecurityContextHolder - Spring Security đã biết user này là ai
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            // Cho request đi tiếp
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            // Xử lý nếu token hết hạn hoặc không hợp lệ
            // Bạn có thể custom response 401 tại đây
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token không hợp lệ hoặc đã hết hạn");
            return;
        }
    }
}