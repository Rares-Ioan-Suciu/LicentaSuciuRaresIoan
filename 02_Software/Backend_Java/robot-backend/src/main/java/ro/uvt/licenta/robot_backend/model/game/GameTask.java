package ro.uvt.licenta.robot_backend.model.game;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "game_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "level_id")
    @JsonBackReference
    private GameLevel gameLevel;

    @Enumerated(EnumType.STRING)
    private TaskType type;

    @Column(length = 500)
    private String requirement;

    @Column(columnDefinition = "TEXT")
    private String taskData;

    @Column(length = 1000)
    private String aiHintContext;

    private Integer orderIndex;

}