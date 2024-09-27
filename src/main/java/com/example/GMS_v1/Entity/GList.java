package com.example.GMS_v1.Entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "list")
public class GList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "list_id")
    private Long listId;

    @Column(name = "list_name", nullable = false, length = 255)
    private String listName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "version_created", nullable = false)
    private Long versionCreated;

    @Column(name = "version_now", nullable = false)
    private Long versionNow;

    @Column(name = "version_abandoned")
    private Long versionAbandoned;

    @JsonIgnore
    @OneToMany(mappedBy = "list", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Term> terms;

    public String getListName() {
        return listName;
    }

    public void setListName(String listName) {
        this.listName = listName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getVersionCreated() {
        return versionCreated;
    }

    public void setVersionCreated(Long versionCreated) {
        this.versionCreated = versionCreated;
    }

    public Long getVersionNow() {
        return versionNow;
    }

    public void setVersionNow(Long versionNow) {
        this.versionNow = versionNow;
    }

    public Long getVersionAbandoned() {
        return versionAbandoned;
    }

    public void setVersionAbandoned(Long versionAbandoned) {
        this.versionAbandoned = versionAbandoned;
    }

    public Set<Term> getTerms() {
        return terms;
    }

    public void setTerms(Set<Term> terms) {
        this.terms = terms;
    }

    public Long getListId() {
        return listId;
    }

    public void setListId(Long listId) {
        this.listId = listId;
    }
}
