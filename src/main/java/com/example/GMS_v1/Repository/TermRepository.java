package com.example.GMS_v1.Repository;

import com.example.GMS_v1.Entity.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TermRepository extends JpaRepository<Term, Long> {

    // Partial match for search
    @Query("SELECT t FROM Term t WHERE t.jpTerm LIKE %:keyword% OR t.engTerm LIKE %:keyword%")
    List<Term> searchTermsByKeyword(@Param("keyword") String keyword);

    // Get terms by list
    List<Term> findByListListId(Long listId);
}
