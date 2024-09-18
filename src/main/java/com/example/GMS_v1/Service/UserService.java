package com.example.GMS_v1.Service;

import com.example.GMS_v1.Entity.User;
import com.example.GMS_v1.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        User user = userRepository.findByUsername(username);
        if(user == null){
            throw new UsernameNotFoundException("User not found");
        }
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                Collections.singleton(new SimpleGrantedAuthority("ROLE_"+user.getRole()))
        );
    }

//
//    private final UserRepository userRepository;
//    private final BCryptPasswordEncoder passwordEncoder;
//
//    @Autowired
//    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
//        this.userRepository = userRepository;
//        this.passwordEncoder = passwordEncoder;
//    }
//
//    public User registerUser(User user) {
//        // Encode the password
//        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
//        // Set default role as "user"
//        user.setRole("user");
//        return (User) userRepository.save(user);
//    }
//
//    public Optional<User> findUserByUsername(String username) {
//        return userRepository.findByUsername(username);
//    }
//
//    public boolean userExists(String username) {
//        return userRepository.findByUsername(username).isPresent();
//    }
}
