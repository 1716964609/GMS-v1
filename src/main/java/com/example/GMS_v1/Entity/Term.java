package com.example.GMS_v1.Entity;


import jakarta.persistence.*;

@Entity
@Table(name = "term")
public class Term {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "term_id")
    private Long termId;

    @Column(name = "jp_term", nullable = false, columnDefinition = "TEXT")
    private String jpTerm;

    @Column(name = "eng_term", nullable = false, columnDefinition = "TEXT")
    private String engTerm;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "version_created", nullable = false)
    private Long versionCreated;

    @Column(name = "version_now", nullable = false)
    private Long versionNow;

    @Column(name = "version_abandoned")
    private Long versionAbandoned;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private GList list;


    public Long getTermId() {
        return termId;
    }

    public void setTermId(Long termId) {
        this.termId = termId;
    }

    public String getJpTerm() {
        return jpTerm;
    }

    public void setJpTerm(String jpTerm) {
        this.jpTerm = jpTerm;
    }

    public String getEngTerm() {
        return engTerm;
    }

    public void setEngTerm(String engTerm) {
        this.engTerm = engTerm;
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

    public GList getList() {
        return list;
    }

    public void setList(GList GList) {
        this.list = GList;
    }
}
