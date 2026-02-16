package ro.uvt.licenta.robot_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.uvt.licenta.robot_backend.model.game.GameSession;
import java.util.Optional;


public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    Optional<GameSession> findByAccessCodeAndActiveTrue(String accessCode);
}