package com.example.GMS_v1.Controller;


import com.example.GMS_v1.DTO.IdRequest;
import com.example.GMS_v1.DTO.MatchResultDTO;
import com.example.GMS_v1.DTO.SearchRequest;
import com.example.GMS_v1.Entity.GList;
import com.example.GMS_v1.Entity.Term;
import com.example.GMS_v1.Service.GlossaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/console/user")
@PreAuthorize("hasRole('USER")
public class GlossaryControllerForUser {

    @Autowired
    private GlossaryService glossaryService;

    // API 1: Search terms
    @PostMapping("/search")
    public ResponseEntity<List<MatchResultDTO>> search(@RequestBody SearchRequest searchRequest) {
        return ResponseEntity.ok(glossaryService.search(searchRequest.getKeyword()));
    }

    // API 2: Fetch all lists
    @GetMapping("/lists")
    public ResponseEntity<List<GList>> getLists() {
        return ResponseEntity.ok(glossaryService.getLists());
    }

    // API 3: Fetch list and term based on search result
    @PostMapping("/list-term")
    public ResponseEntity<Map<String, Object>> getSearchResultContent(@RequestBody IdRequest request) {
        GList list = glossaryService.getListById(request.getListId());
        Term term = glossaryService.getTermById(request.getTermId());
        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("term", term);
        return ResponseEntity.ok(result);
    }

    // API 4: Fetch terms in a specific list
    @PostMapping("/terms-in-list")
    public ResponseEntity<List<Term>> getTermsInList(@RequestBody IdRequest request) {
        return ResponseEntity.ok(glossaryService.getTermsInList(request.getListId()));
    }

    // API 5: Fetch term content by id
    @PostMapping("/termContent")
    public ResponseEntity<Term> getTermContent(@RequestBody IdRequest request) {
        return ResponseEntity.ok(glossaryService.getTermContent(request.getTermId()));
    }

}
