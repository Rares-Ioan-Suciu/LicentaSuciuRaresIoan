package ro.uvt.licenta.robot_backend.server.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import ro.uvt.licenta.robot_backend.model.game.GameLevel;
import ro.uvt.licenta.robot_backend.repository.GameLevelRepository;
import ro.uvt.licenta.robot_backend.model.game.GameTask;
import ro.uvt.licenta.robot_backend.repository.GameTaskRepository;

import java.util.List;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "*")
public class GameController {

    private final GameTaskRepository gameTaskRepository;
    private final GameLevelRepository gameLevelRepository;

    public GameController(GameTaskRepository gameTaskRepository, GameLevelRepository gameLevelRepository) {
        this.gameTaskRepository = gameTaskRepository;
        this.gameLevelRepository = gameLevelRepository;
    }

    @GetMapping("/levels")
    public List<GameLevel> getAllLevels() {
        return gameLevelRepository.findAll();
    }

    @GetMapping("/levels/{id}")
    public ResponseEntity<GameLevel> getLevelById(@PathVariable("id") Long id) {
        return gameLevelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/levels/{levelId}/tasks")
    public ResponseEntity<List<GameTask>> getTasksByLevelId(@PathVariable("levelId") Long levelId) {
        if (!gameLevelRepository.existsById(levelId)) {
            return ResponseEntity.notFound().build();
        }
        List<GameTask> tasks = gameTaskRepository.findByGameLevelIdOrderByOrderIndexAsc(levelId);
        return ResponseEntity.ok(tasks);
    }
}