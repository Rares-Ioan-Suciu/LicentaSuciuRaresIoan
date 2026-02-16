package ro.uvt.licenta.robot_backend.model.game;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class StudentProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference
    private GameSession session;

    @Column(nullable = false)
    private String studentName;

    @Column(name = "current_task_index")
    private Integer currentTaskIndex = 0;

    private Integer score = 0;

    @Column(name = "error_count")
    private Integer errorCount = 0; // Câte greseli a făcut

    @Column(name = "needs_help")
    private Boolean needsHelp = false; // Dacă a apăsat pe butonul de ajutor

    @Column(name = "last_error_details", length = 1000)
    private String lastErrorDetails; // Detalii despre ultima greșeală pentru profesor

    @Column(length = 1000)
    private String aiHintHistory = "";

    @Enumerated(EnumType.STRING)
    private HelpStatus helpStatus = HelpStatus.NONE;

    @com.fasterxml.jackson.annotation.JsonProperty("sessionId")
    public Long getSessionIdValue() {
        return (this.session != null) ? this.session.getId() : null;
    }
}
