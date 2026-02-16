package ro.uvt.licenta.robot_backend.server.controller;

import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.uvt.licenta.robot_backend.model.game.GameSession;
import ro.uvt.licenta.robot_backend.server.service.GameSessionService;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    private final GameSessionService gameSessionService;
    private final GameSocketHandler gameSocketHandler;

    public SessionController(GameSessionService gameSessionService, @Lazy GameSocketHandler gameSocketHandler) {
        this.gameSessionService = gameSessionService;
        this.gameSocketHandler = gameSocketHandler;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSession(@RequestParam Long levelId, @RequestParam String teacher) {
        try {
            var session = gameSessionService.createSession(levelId, teacher);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinSession(@RequestParam String code, @RequestParam String name) {
        try {
            var progress = gameSessionService.joinSession(code, name);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Sesiunea " + code + " nu există!");
        }
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long id) {
        try {
            String csvData = gameSessionService.generateSessionReportCsv(id);
            byte[] output = csvData.getBytes();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, STR."attachment; filename=raport_sesiune_\{id}.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(output);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}/terminate")
    public ResponseEntity<String> terminateSession(@PathVariable Long id) {
        try {
            String accessCode = gameSessionService.getSessionAccessCode(id);
            System.out.println("🚀 [CONTROLLER DEBUG] Codul recuperat pentru închidere este: " + accessCode);
            gameSocketHandler.broadcastSessionTermination(accessCode);

            Thread.sleep(1000);
            gameSessionService.deleteSessionData(id);

            return ResponseEntity.ok("Sesiune închisă cu succes. Elevii au fost notificați.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Eroare la închidere: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameSession> getSessionById(@PathVariable Long id) {
        return gameSessionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}