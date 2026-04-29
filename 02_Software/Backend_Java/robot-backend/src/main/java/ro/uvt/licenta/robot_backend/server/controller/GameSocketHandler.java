package ro.uvt.licenta.robot_backend.server.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import ro.uvt.licenta.robot_backend.model.game.StudentProgress;
import ro.uvt.licenta.robot_backend.server.service.GameSessionService;
import ro.uvt.licenta.robot_backend.server.service.OpenAIService;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class GameSocketHandler extends TextWebSocketHandler {

    private final GameSessionService gameSessionService;
    private final OpenAIService openAIService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String ESP32_IP = "192.168.1.140";

    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    private volatile String stationedStudent = null;
    private volatile String stationedAccessCode = null;
    private volatile String stationedLanguage = "ro"; // Salvăm limba elevului la care a fost trimis robotul

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("SERVER A PRIMIT: " + message.getPayload());
        JsonNode json = objectMapper.readTree(message.getPayload());
        String type = json.get("type").asText();

        String accessCode = json.path("accessCode").asText("GLOBAL");

        switch (type) {
            case "JOIN":
                handleJoin(session, json, accessCode);
                break;
            case "wrong_answer":
                handleWrongAnswer(json, accessCode);
                break;
            case "UPDATE_PROGRESS":
                handleUpdateProgress(json, accessCode);
                break;
            case "HELP_REQUEST":
                handleHelpRequest(json, accessCode);
                break;
            case "AI_DELEGATE":
                handleAiDelegation(json, accessCode);
                break;
            case "TEACHER_BROADCAST":
                handleBroadcast(json, accessCode);
                break;
            case "TEACHER_REPLY":
                handleTeacherReply(json, accessCode);
                break;
            case "SHOW_EXTRACTION_CODE":
                // Rutează comanda de puzzle fizic de la profesor direct către robot
                sendToUser("GLOBAL", "robot", Map.of(
                        "type", "SHOW_EXTRACTION_CODE",
                        "code", json.path("code").asText("0000")
                ));
                break;
            case "ROBOT_SPEAK":
                sendToUser("GLOBAL", "robot", Map.of(
                        "type", "VOICE_HINT",
                        "message", json.get("text").asText(),
                        "lang", "ro-RO"
                ));
                break;
            case "ROBOT_DISPATCH":
                sendToUser("GLOBAL", "robot", Map.of(
                        "type", "ROBOT_DISPATCHED",
                        "studentData", json.get("studentData")
                ));
                break;
            case "ROBOT_ENGAGED":
                stationedStudent = json.has("studentName") ? json.get("studentName").asText() : json.get("username").asText();
                stationedAccessCode = accessCode;

                handleAiDelegation(json, accessCode);
                break;
        }
    }

    // Funcție mică pentru a detecta materia pe baza textului din task
    private String detectLanguage(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("francez") || lower.contains("tradu") || lower.contains("louvre")
                || lower.contains("croissant") || lower.contains("bonjour") || lower.contains("passé")) {
            return "fr";
        }
        return "ro";
    }

    private void handleAiDelegation(JsonNode json, String code) throws Exception {
        String studentName = json.has("studentName") ? json.path("studentName").asText("Elev") : json.path("username").asText("Elev");
        String taskRequirement = json.path("task").asText("Nespecificată");
        Long sessionId = json.path("sessionId").asLong();

        JsonNode details = json.path("details");
        if (details.isTextual() && details.asText().startsWith("{")) {
            try {
                details = objectMapper.readTree(details.asText());
            } catch (Exception e) {
                System.err.println("Eroare la parsarea detaliilor JSON: " + e.getMessage());
            }
        }

        StudentProgress progress = gameSessionService.getStudentProgress(code, studentName);
        String history = progress.getAiHintHistory() != null ? progress.getAiHintHistory() : "";

        String question = details.path("question").asText("Nespecificată");
        String correctAnswer = details.path("correctAnswer").asText("Nespecificat");
        String studentAnswer = details.path("studentAnswer").asText("Nespecificat");
        String extraContext = details.path("context").asText("Fără note suplimentare");

        String fullContext = String.format(
                "Cerință: %s | Context Întrebare: %s | Răspuns Corect: %s | Răspuns Elev: %s | Detalii Extra: %s",
                taskRequirement, question, correctAnswer, studentAnswer, extraContext
        );

        // Detectăm limba și o salvăm pentru sesiunea robotului cu acest elev
        String limba = detectLanguage(fullContext);
        if (studentName.equals(stationedStudent)) {
            stationedLanguage = limba;
        }

        // Generăm hint-ul trimițând și parametrul de limbă ('fr' sau 'ro') către AI
        String hint = openAIService.generateAIHint(fullContext, taskRequirement, history, limba);

        gameSessionService.addAiHintToHistory(code, studentName, hint);

        notifyTeacher(code, "AI_HINT_GENERATED", Map.of(
                "studentName", studentName,
                "hint", hint,
                "timestamp", System.currentTimeMillis()
        ));

        // Trimitem feedback-ul text la elev pe laptop
        sendToUser(code, studentName, Map.of(
                "type", "ai_feedback",
                "message", "Beatrix: " + hint
        ));

        // Trimitem feedback-ul VOCAL către Fața Robotului cu setarea de limbă corectă
        sendToUser("GLOBAL", "robot", Map.of(
                "type", "VOICE_HINT",
                "message", hint,
                "lang", limba.equals("fr") ? "fr-FR" : "ro-RO"
        ));
    }

    private void handleWrongAnswer(JsonNode json, String code) throws Exception {
        String studentName = json.get("username").asText();
        JsonNode detailsNode = json.get("details");

        String detailsStr = detailsNode.isObject() ? detailsNode.toString() : detailsNode.asText();
        int taskIndex = json.get("taskIndex").asInt();

        StudentProgress update = gameSessionService.updateStudentStatus(
                json.get("sessionId").asLong(), studentName, taskIndex, true, detailsStr
        );
        notifyTeacher(code, "STUDENT_UPDATE", update);


        if (studentName.equals(stationedStudent) && code.equals(stationedAccessCode)) {
            System.out.println("[ROBOT] Elevul mentorat a greșit! Cer un nou sfat AI.");

            triggerESP32Emote(2); // Declanșează eșec pe mașinuță

            // Reacționează în limba potrivită materiei
            String oopsMessage = stationedLanguage.equals("fr")
                    ? "Oh non, ce n'est pas ça ! Laisse-moi chercher un autre indice..."
                    : "Of, nu e chiar așa! Lasă-mă să mă gândesc la alt indiciu...";
            String langCode = stationedLanguage.equals("fr") ? "fr-FR" : "ro-RO";

            sendToUser("GLOBAL", "robot", Map.of(
                    "type", "VOICE_HINT",
                    "message", oopsMessage,
                    "lang", langCode
            ));

            handleAiDelegation(json, code);
        }
    }

    private void handleUpdateProgress(JsonNode json, String accessCode) throws Exception {
        String studentName = json.get("username").asText();
        Long sessionId = json.get("sessionId").asLong();
        int taskIndex = json.get("taskIndex").asInt();
        int score = json.get("score").asInt();

        StudentProgress updated = gameSessionService.updateStudentProgress(sessionId, studentName, taskIndex, score);
        notifyTeacher(accessCode, "STUDENT_UPDATE", updated);

        if (studentName.equals(stationedStudent) && accessCode.equals(stationedAccessCode)) {
            System.out.println("[ROBOT] Elevul mentorat a reușit! Eliberez robotul.");

            triggerESP32Emote(1); // Declanșează victorie pe mașinuță

            // Felicită elevul în limba potrivită materiei
            String bravoMessage = stationedLanguage.equals("fr")
                    ? "Excellent ! Réponse parfaite ! Mission accomplie, je rentre à la base."
                    : "Excelent! Răspuns perfect! Misiune îndeplinită, mă întorc la bază.";
            String langCode = stationedLanguage.equals("fr") ? "fr-FR" : "ro-RO";

            sendToUser("GLOBAL", "robot", Map.of(
                    "type", "VOICE_HINT",
                    "message", bravoMessage,
                    "lang", langCode
            ));

            stationedStudent = null;
            stationedAccessCode = null;
            stationedLanguage = "ro"; // reset
        }
    }

    private void handleTeacherReply(JsonNode json, String accessCode) throws Exception {
        String studentName = json.path("studentName").asText();
        String messageContent = json.path("details").asText("Profesorul nu a scris nimic.");
        sendToUser(accessCode, studentName, Map.of(
                "type", "teacher_reply",
                "message", messageContent
        ));
    }

    private void handleBroadcast(JsonNode json, String accessCode) {
        String message = json.get("text").asText();
        userSessions.forEach((key, session) -> {
            if (key.startsWith(accessCode + "_") && !key.endsWith("_teacher")) {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                                "type", "BROADCAST_PIN",
                                "text", message
                        ))));
                    }
                } catch (Exception e) { e.printStackTrace(); }
            }
        });
    }

    private void handleHelpRequest(JsonNode json, String accessCode) throws Exception {
        String studentName = json.get("username").asText();
        Long sessionId = json.get("sessionId").asLong();

        StudentProgress updatedProgress = gameSessionService.requestHelp(sessionId, studentName);
        notifyTeacher(accessCode, "STUDENT_NEEDS_HELP", updatedProgress);
    }

    private void handleJoin(WebSocketSession session, JsonNode json, String code) throws Exception {
        String username = json.get("username").asText();
        String role = json.get("role").asText();

        userSessions.put(code + "_" + username, session);

        if ("STUDENT".equals(role)) {
            StudentProgress progress = gameSessionService.joinSession(code, username);
            notifyTeacher(code, "STUDENT_JOINED", progress);
        }
    }

    private void notifyTeacher(String accessCode, String type, Object data) throws Exception {
        WebSocketSession teacherSession = userSessions.get(accessCode + "_teacher");
        if (teacherSession != null && teacherSession.isOpen()) {
            synchronized(teacherSession) {
                teacherSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                        "type", type,
                        "data", data
                ))));
            }
        }
    }

    private void sendToUser(String code, String username, Object message) throws Exception {
        WebSocketSession session = userSessions.get(code + "_" + username);
        if (session != null && session.isOpen()) {
            synchronized(session) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
            }
        }
    }

    public void broadcastSessionTermination(String accessCode) {
        Map<String, String> terminateMessage = Map.of(
                "type", "SESSION_TERMINATED",
                "message", "Sesiunea a fost închisă de profesor. "
        );

        try{
            String payload = objectMapper.writeValueAsString(terminateMessage);
            System.out.println(" Încep broadcast pentru codul: " + accessCode);

            userSessions.forEach((key, session) ->{
                if(key.startsWith(accessCode + "_") && session.isOpen()) {
                    try {
                        synchronized (session) {
                            session.sendMessage(new TextMessage(payload));
                        }
                    } catch (Exception e) {
                        System.err.println("Eroare la trimitere");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        userSessions.values().remove(session);
    }

    private void triggerESP32Emote(int emoteId) {
        new Thread(() -> {
            try {
                String url = "http://" + ESP32_IP + "/emote?id=" + emoteId;
                System.out.println("[ESP32 FETCH] Trimit comanda către: " + url);

                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                String response = restTemplate.getForObject(url, String.class);

                System.out.println("[ESP32 SUCCESS] Robotul a dansat! Răspuns: " + response);
            } catch (Exception e) {
                System.err.println("[ESP32 ERROR] Nu am putut mișca robotul: " + e.getMessage());
            }
        }).start();
    }
}