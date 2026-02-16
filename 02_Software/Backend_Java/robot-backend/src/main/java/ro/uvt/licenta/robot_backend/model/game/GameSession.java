package ro.uvt.licenta.robot_backend.model.game;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "access_code", unique = true, nullable = false, length = 6)
    private String accessCode;

    @ManyToOne
    @JoinColumn(name = "level_id", nullable = false)
    private GameLevel gameLevel;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean active = true;

    private String teacherUsername;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<StudentProgress> students;


}
