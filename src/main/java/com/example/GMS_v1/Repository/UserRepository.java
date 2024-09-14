package com.example.GMS_v1.Repository;

import com.example.GMS_v1.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository {

    Optional<User> findByUsername(String username);
}
