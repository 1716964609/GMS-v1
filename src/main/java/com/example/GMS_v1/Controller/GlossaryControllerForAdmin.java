package com.example.GMS_v1.Controller;


import com.example.GMS_v1.DTO.*;
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
@RequestMapping("/console/admin")
@PreAuthorize("hasRole('ADMIN")
public class GlossaryControllerForAdmin {

    @Autowired
    private GlossaryService glossaryService;

    // API 1: Search terms when the button is pressed and display the content on the search result table
    @PostMapping("/search")
    public ResponseEntity<List<MatchResultDTO>> search(@RequestBody SearchRequest searchRequest) {
        return ResponseEntity.ok(glossaryService.search(searchRequest.getKeyword()));
    }

    // API 2: Fetch all lists on default load of the page and display the content on the list names table
    @GetMapping("/lists")
    public ResponseEntity<List<GList>> getLists() {
        return ResponseEntity.ok(glossaryService.getLists());
    }

    // API 3: When a search result is clicked, fetch the list and term based on search result and display them on the tables and content divs
    @PostMapping("/list-term")
    public ResponseEntity<Map<String, Object>> getSearchResultContent(@RequestBody IdRequest request) {
        GList list = glossaryService.getListById(request.getListId());
        Term term = glossaryService.getTermById(request.getTermId());
        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("term", term);
        return ResponseEntity.ok(result);
    }

    // API 4: Fetch terms in a specific list and display them on the terms table
    @PostMapping("/terms-in-list")
    public ResponseEntity<List<Term>> getTermsInList(@RequestBody ListId listId) {
        return ResponseEntity.ok(glossaryService.getTermsInList(listId.getListId()));
    }

    // API 5: when a term name is clicked, fetch the term content by id and display it on the glossary term details content div
    @PostMapping("/termContent")
    public ResponseEntity<Term> getTermContent(@RequestBody TermId termId) {
        return ResponseEntity.ok(glossaryService.getTermContent(termId.getTermId()));
    }

    // Admin only CRUD operations: button click triggers a pop window that modifies the content of a list, post the content on click the submit button on the pop window.(specific term need to be selected when the functionality is update. None needs to be selected when create.)
    @PostMapping("/list")
    public ResponseEntity<GList> createOrUpdateList(@RequestBody GList list) {
        return ResponseEntity.ok(glossaryService.createOrUpdateList(list));
    }
    // button click triggers a pop window that modifies the content of a term, post the content on click the submit button on the pop window. (specific term need to be selected when the functionality is update. None needs to be selected when create.)
    @PostMapping("/term")
    public ResponseEntity<Term> createOrUpdateTerm(@RequestBody Term term) {
        return ResponseEntity.ok(glossaryService.createOrUpdateTerm(term));
    }
    // button click triggers a pop window that confirms whether to delete the selected list, execute the API on confirming
    @DeleteMapping("/list")
    public ResponseEntity<Void> deleteList(@RequestBody IdRequest request) {
        glossaryService.deleteList(request.getListId());
        return ResponseEntity.noContent().build();
    }
    // button click triggers a pop window that confirms whether to delete the selected term, execute the API on confirming
    @DeleteMapping("/term")
    public ResponseEntity<Void> deleteTerm(@RequestBody IdRequest request) {
        glossaryService.deleteTerm(request.getTermId());
        return ResponseEntity.noContent().build();
    }
}
