package com.example.GMS_v1.Controller;

import com.example.GMS_v1.Entity.User;
import com.example.GMS_v1.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

//    @GetMapping
//    public String landingPage(){
//        return "redirect:/UserRelated/landingpage.html";
//    }
    @GetMapping
    public String landingPage(){
        return "redirect:/landingPage/landingPage.html";
    }

//    @PostMapping("/login")
//    public String loginPage(){
//        return "redirect:/UserRelated/login.html";
//    }

//    @PostMapping("/login")
//    public void handleLogin() {
//        // This can be left empty; Spring Security will handle login automatically
//    }


    @PreAuthorize("hasRole('USER')")
    @GetMapping("/console/user")
    public String userConsole(){
        return "redirect:/consolepage_user.html";
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/console/admin")
    public String adminConsole() {
        // This method returns the admin console page after successful login
        return "redirect:/consolepage.html";  // This should be the name of your admin console HTML page (adminConsole.html)
    }

//    @GetMapping("/register")
//    public String registrationPage() {
//        return "redirect:/UserRelated/registration.html"; // Name of the HTML file without the .html extension
//    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody User user) {
        System.out.println("register starts");
        if (userService.userExists(user.getUsername())) {
            return ResponseEntity.badRequest().body("ユーザー名（メール）すでに使用されています。");
        }
        userService.registerUser(user);
        return ResponseEntity.ok("ユーザー登録が成功しました。");
    }

//    @PostMapping("/login")
//    public ResponseEntity<String> loginUser(@Valid @RequestBody User loginUser) {
//        return userService.findUserByUsername(loginUser.getUsername())
//                .filter(user -> user.getPasswordHash().equals(loginUser.getPasswordHash())) // this will compare the raw password hash
//                .map(user -> ResponseEntity.ok("Login successful"))
//                .orElse(ResponseEntity.status(401).body("Invalid credentials"));
//    }


}
