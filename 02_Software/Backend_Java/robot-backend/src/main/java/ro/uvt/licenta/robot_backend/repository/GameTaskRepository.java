package ro.uvt.licenta.robot_backend.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import ro.uvt.licenta.robot_backend.model.game.GameTask;

import java.util.List;

@Repository
public interface GameTaskRepository extends JpaRepository<GameTask, Long> {
    List<GameTask> findByGameLevelIdOrderByOrderIndexAsc(Long levelId);
}
