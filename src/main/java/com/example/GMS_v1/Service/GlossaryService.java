package com.example.GMS_v1.Service;

import com.example.GMS_v1.DTO.MatchResultDTO;
import com.example.GMS_v1.Entity.GList;
import com.example.GMS_v1.Entity.Term;
import com.example.GMS_v1.Repository.GListRepository;
import com.example.GMS_v1.Repository.TermRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GlossaryService {


    @Autowired
    private GListRepository gListRepository;

    @Autowired
    private TermRepository termRepository;

    // API 1: Search terms by keyword
    public List<MatchResultDTO> search(String keyword) {
        List<Term> terms = termRepository.searchTermsByKeyword(keyword);
        List<MatchResultDTO> results = new ArrayList<>();

        // Separate JP and ENG matches into different DTOs
        for (Term term : terms) {
            if (term.getJpTerm().contains(keyword)) {
                results.add(new MatchResultDTO(term.getTermId(), term.getJpTerm(), term.getList().getListId()));
            }
            if (term.getEngTerm().contains(keyword)) {
                results.add(new MatchResultDTO(term.getTermId(), term.getEngTerm(), term.getList().getListId()));
            }
        }
        return results;
    }

    // API 2: Fetch all lists
    public List<GList> getLists() {
        return gListRepository.findAll();
    }

    // API 3: Get content for a specific search result
    public GList getListById(Long listId) {
        return gListRepository.findById(listId).orElse(null);
    }

    public Term getTermById(Long termId) {
        return termRepository.findById(termId).orElse(null);
    }

    // API 4: Get terms in a specific list
    public List<Term> getTermsInList(Long listId) {
        return termRepository.findByListListId(listId);
    }

    // API 5: Get specific term content
    public Term getTermContent(Long termId) {
        return termRepository.findById(termId).orElse(null);
    }

    // CRUD operations for Admin
    @PreAuthorize("hasRole('ADMIN')")
    public GList createOrUpdateList(GList list) {
        return gListRepository.save(list);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Term createOrUpdateTerm(Term term) {
        return termRepository.save(term);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteList(Long listId) {
        gListRepository.deleteById(listId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTerm(Long termId) {
        termRepository.deleteById(termId);
    }

}
