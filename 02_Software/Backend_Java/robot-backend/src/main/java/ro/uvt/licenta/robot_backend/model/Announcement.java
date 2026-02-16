package ro.uvt.licenta.robot_backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import jakarta.persistence.*;


@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime date = LocalDateTime.now();
    private String author;

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    @JsonIgnore
    private Classroom classroom;

    public Announcement(String content, String author, Classroom classroom) {
        this.content = content;
        this.author = author;
        this.classroom = classroom;
    }
}
