package com.example.GMS_v1.Config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.util.Set;

@Configuration
public class SecurityConfig {

//    private final CustomUserDetailsService customUserDetailsService;
//
//    @Autowired
//    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
//        this.customUserDetailsService = customUserDetailsService;
//    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http

                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/","/csrf-token","/landing page/**").permitAll() // Public URLs
                        .anyRequest().authenticated() // All other URLs require authentication
                )
                .formLogin(form -> form
                        .loginPage("/landing page/landing page - new.html") // Custom login page
                        .loginProcessingUrl("/login") // Handle login processing at this URL
                        .successHandler(customAuthenticationSuccessHandler()) // Custom success handler
                        .permitAll() // Allow all users to see the login page
                );
        return http.build();
    }


    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    public AuthenticationSuccessHandler customAuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            System.out.println("Getting authorities");
            String role = authentication.getAuthorities().iterator().next().getAuthority();
            System.out.println("autho done");
            if (role.equals("ROLE_ADMIN")) {
                response.sendRedirect("/console/admin");
            } else if (role.equals("ROLE_USER")) {
                response.sendRedirect("/console/user");
            } else {
                response.sendRedirect("/landing page/landing page - new.html?error"); // Fallback in case of no matching role
            }
        };
    }


    //    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
//        http
//                .authorizeHttpRequests(authorize -> authorize
//                        .requestMatchers("/","/login","/register","/UserRelated/**").permitAll()
//                        .requestMatchers("/admin/console","/consolepage.html","/consolepage.css").hasRole("ADMIN")
//                        .requestMatchers("/user/console","/consolepage_user.html","/console_user.css").hasRole("USER")
//                        .anyRequest().authenticated()
//                )
//                .formLogin(formLogin -> formLogin
//                        .loginPage("/login")
//                        .permitAll()
//                        .successHandler(customAuthenticationSuccessHandler())
//                );
//        return http.build();
//    }

//    @Bean
//    public DaoAuthenticationProvider daoAuthenticationProvider() {
//        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
//        provider.setUserDetailsService(customUserDetailsService);
//        provider.setPasswordEncoder(passwordEncoder());
//        return provider;
//    }
//
//    // Configure AuthenticationManager to use DaoAuthenticationProvider
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
//        return authenticationConfiguration.getAuthenticationManager();
//    }

//    public AuthenticationSuccessHandler customAuthenticationSuccessHandler(){
//        return new AuthenticationSuccessHandler() {
//            @Override
//            public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
//                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//                Set<String> roles = AuthorityUtils.authorityListToSet(userDetails.getAuthorities());
//
//                if(roles.contains("ROLE_ADMIN")){
//                    response.sendRedirect("/admin/console");
//                } else if (roles.contains("ROLE_USER")) {
//                    response.sendRedirect("/user/console");
//                } else {
//                    response.sendRedirect("/");
//                }
//            }
//        };
//    }
}
