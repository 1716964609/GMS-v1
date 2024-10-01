package com.example.GMS_v1.Controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CsrfController {
    @GetMapping("/csrf-token")
    public CsrfToken csrfToken(HttpServletRequest request) {
        System.out.println("csrf on");
        return (CsrfToken) request.getAttribute(CsrfToken.class.getName());
    }
}
