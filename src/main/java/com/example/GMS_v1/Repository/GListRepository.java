package com.example.GMS_v1.Repository;

import com.example.GMS_v1.Entity.GList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GListRepository extends JpaRepository<GList, Long> {
    List<GList> findAll();
}
