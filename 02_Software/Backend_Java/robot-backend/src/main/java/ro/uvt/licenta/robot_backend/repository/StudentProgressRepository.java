package ro.uvt.licenta.robot_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.uvt.licenta.robot_backend.model.game.GameSession;
import ro.uvt.licenta.robot_backend.model.game.StudentProgress;

import java.util.List;
import java.util.Optional;

public interface StudentProgressRepository extends JpaRepository<StudentProgress, Long> {
    List<StudentProgress> findAllBySession(GameSession session);
    Optional<StudentProgress> findBySession_AccessCodeAndStudentName(String accessCode, String studentName);
    Optional<StudentProgress> findBySessionAndStudentName(GameSession session, String studentName);
}