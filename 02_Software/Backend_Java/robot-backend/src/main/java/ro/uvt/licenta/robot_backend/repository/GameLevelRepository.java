package ro.uvt.licenta.robot_backend.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import ro.uvt.licenta.robot_backend.model.game.GameLevel;
import ro.uvt.licenta.robot_backend.model.game.GameTask;

import java.util.Optional;

@Repository
public interface GameLevelRepository extends JpaRepository<GameLevel, Long> {
    Optional<GameLevel> findByTitle(String title);
}

