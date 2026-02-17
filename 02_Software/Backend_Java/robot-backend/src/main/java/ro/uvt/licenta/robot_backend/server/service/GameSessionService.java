package ro.uvt.licenta.robot_backend.server.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.uvt.licenta.robot_backend.model.game.*;
import ro.uvt.licenta.robot_backend.repository.GameLevelRepository;
import ro.uvt.licenta.robot_backend.repository.GameSessionRepository;
import ro.uvt.licenta.robot_backend.repository.StudentProgressRepository;


import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GameSessionService {

    private final GameSessionRepository gameSessionRepository;
    private final StudentProgressRepository studentProgressRepository;
    private final GameLevelRepository gameLevelRepository;


    @Transactional
    public GameSession createSession(Long levelId, String teacherUsername) {

        GameLevel level = gameLevelRepository.findById(levelId).orElseThrow(()
                -> new RuntimeException("Nivel inexistent!"));

        GameSession session = GameSession.builder()
                .accessCode(generateCode())
                .gameLevel(level)
                .createdAt(LocalDateTime.now())
                .active(true)
                .teacherUsername(teacherUsername)
                .build();

        return gameSessionRepository
                .save(session);
    }

    @Transactional
    public StudentProgress joinSession(String accessCode, String studentUsername) {
        GameSession session = gameSessionRepository.findByAccessCodeAndActiveTrue(accessCode)
                .orElseThrow(() -> new RuntimeException("Cod sesiune invalid sau expirat!!!"));

        return studentProgressRepository.findBySessionAndStudentName(session, studentUsername)
                .orElseGet(() -> studentProgressRepository.save(StudentProgress.builder()
                        .session(session)
                        .studentName(studentUsername)
                        .currentTaskIndex(0)
                        .errorCount(0)
                        .score(0)
                        .helpStatus(HelpStatus.NONE)
                        .build()));


    }

    @Transactional
    public StudentProgress updateStudentStatus(Long sessionId, String studentName, int taskIndex, boolean isError, String details) {
        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Sesiune inexistenta"));

        StudentProgress progress = studentProgressRepository.findBySessionAndStudentName(session, studentName)
                .orElseThrow(() -> new RuntimeException("Studentul nu a participat la aceasta sesiune"));

        progress.setCurrentTaskIndex(taskIndex);

        if (isError) {
            progress.setErrorCount(progress.getErrorCount() + 1);
            progress.setLastErrorDetails(details);
            progress.setNeedsHelp(false);
        } else {
            progress.setScore(progress.getScore() + 100);
        }

        return studentProgressRepository.save(progress);
    }


    @Transactional
    public StudentProgress requestHelp(Long sessionId, String studentName) {
        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Sesiune inexistenta"));

        StudentProgress progress = studentProgressRepository.findBySessionAndStudentName(session, studentName)
                .orElseThrow(() -> new RuntimeException("Studentul nu a fost găsit"));

        progress.setNeedsHelp(true);
        progress.setHelpStatus(HelpStatus.PENDING);
        return studentProgressRepository.save(progress);
    }

    @Transactional(readOnly = true)
    public String generateSessionReportCsv(Long sessionId) {
        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Sesiunea nu a fost găsită"));

        List<StudentProgress> results = studentProgressRepository.findAllBySession(session);

        StringBuilder csv = new StringBuilder();
        csv.append("Nume Elev,Scor Final,Greșeli Totale,Ultima Etapă,Detalii Erori\n");

        for (StudentProgress p : results) {
            csv.append(String.format("%s,%d,%d,%d,\"%s\"\n",
                    p.getStudentName(),
                    p.getScore(),
                    p.getErrorCount(),
                    p.getCurrentTaskIndex() + 1,
                    p.getLastErrorDetails() != null ? p.getLastErrorDetails().replace("\"", "'") : "Nicio eroare"
            ));
        }
        return csv.toString();
    }

    @Transactional
    public StudentProgress updateStudentProgress(Long sessionId, String studentName, int taskIndex, int score) {
        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Sesiune inexistenta"));

        StudentProgress progress = studentProgressRepository.findBySessionAndStudentName(session, studentName)
                .orElseThrow(() -> new RuntimeException("Student negăsit"));

        progress.setCurrentTaskIndex(taskIndex);
        progress.setScore(score);
        if (progress.getNeedsHelp() != null && progress.getNeedsHelp()) {
            progress.setNeedsHelp(false);
            progress.setHelpStatus(HelpStatus.NONE);
        }

        return studentProgressRepository.save(progress);
    }

    @Transactional
    public void deleteSessionData(Long sessionId) {

        gameSessionRepository.deleteById(sessionId);
        System.out.println("Datele sesiunii " + sessionId + " au fost șterse definitiv din baza de date.");
    }

    @Transactional(readOnly = true)
    public StudentProgress getStudentProgress(String accessCode, String studentName) {
        return studentProgressRepository.findBySession_AccessCodeAndStudentName(accessCode, studentName)
                .orElseThrow(() -> new RuntimeException("Progresul pentru " + studentName + " în sesiunea " + accessCode + " nu a fost găsit!"));
    }

    @Transactional
    public void addAiHintToHistory(String accessCode, String studentName, String newHint) {

        StudentProgress progress = getStudentProgress(accessCode, studentName);

        String currentHistory = progress.getAiHintHistory();
        String updatedHistory = (currentHistory == null || currentHistory.isEmpty())
                ? newHint
                : STR."\{currentHistory} | \{newHint}";

        if (updatedHistory.length() > 950) {
            updatedHistory = updatedHistory.substring(updatedHistory.length() - 950);
        }

        progress.setAiHintHistory(updatedHistory);
        studentProgressRepository.save(progress);
    }

    @Transactional(readOnly = true)
    public String getSessionAccessCode(Long sessionId){
        return gameSessionRepository.findById(sessionId)
                .map(GameSession::getAccessCode)
                .orElseThrow(() -> new RuntimeException(STR."Sesiunea nu a fost găsită pentru ID: \{sessionId}"));
    }

    private String generateCode() {

        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    public Optional<GameSession> findById(Long id) {
        return gameSessionRepository.findById(id);
    }

}
