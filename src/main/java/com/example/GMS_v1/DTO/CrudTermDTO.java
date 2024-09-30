package com.example.GMS_v1.DTO;

import jakarta.validation.constraints.NotNull;

public class CrudTermDTO {

    private Long termId;

    @NotNull
    private String jpTerm;

    @NotNull
    private String engTerm;

    private String description;

    @NotNull
    private Long versionCreated;

    @NotNull
    private Long versionNow;

    private Long versionAbandoned;

    @NotNull
    private Long listId; // Assuming you're using list ID to reference GList

    public Long getTermId() {
        return termId;
    }

    public void setTermId(Long termId) {
        this.termId = termId;
    }

    public @NotNull String getJpTerm() {
        return jpTerm;
    }

    public void setJpTerm(@NotNull String jpTerm) {
        this.jpTerm = jpTerm;
    }

    public @NotNull String getEngTerm() {
        return engTerm;
    }

    public void setEngTerm(@NotNull String engTerm) {
        this.engTerm = engTerm;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public @NotNull Long getVersionCreated() {
        return versionCreated;
    }

    public void setVersionCreated(@NotNull Long versionCreated) {
        this.versionCreated = versionCreated;
    }

    public @NotNull Long getVersionNow() {
        return versionNow;
    }

    public void setVersionNow(@NotNull Long versionNow) {
        this.versionNow = versionNow;
    }

    public Long getVersionAbandoned() {
        return versionAbandoned;
    }

    public void setVersionAbandoned(Long versionAbandoned) {
        this.versionAbandoned = versionAbandoned;
    }

    public @NotNull Long getListId() {
        return listId;
    }

    public void setListId(@NotNull Long listId) {
        this.listId = listId;
    }
}
