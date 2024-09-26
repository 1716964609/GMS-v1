package com.example.GMS_v1.DTO;

public class MatchResultDTO {
    private Long termId;
    private String termName;
    private Long listId;

    public MatchResultDTO(Long termId, String termName, Long listId) {
        this.termId = termId;
        this.termName = termName;
        this.listId = listId;
    }

    public Long getTermId() {
        return termId;
    }

    public void setTermId(Long termId) {
        this.termId = termId;
    }

    public String getTermName() {
        return termName;
    }

    public void setTermName(String termName) {
        this.termName = termName;
    }

    public Long getListId() {
        return listId;
    }

    public void setListId(Long listId) {
        this.listId = listId;
    }
}
