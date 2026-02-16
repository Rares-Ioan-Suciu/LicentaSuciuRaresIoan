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

    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("📥 SERVER  A PRIMIT: " + message.getPayload());
        JsonNode json = objectMapper.readTree(message.getPayload());
        String type = json.get("type").asText();
        String accessCode = json.get("accessCode").asText();

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
        }
    }

    private void handleAiDelegation(JsonNode json, String code) throws Exception {
        String studentName = json.path("studentName").asText("Elev");
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
                taskRequirement,
                question,
                correctAnswer,
                studentAnswer,
                extraContext
        );

        String hint = openAIService.generateAIHint(fullContext, taskRequirement, history);

        gameSessionService.addAiHintToHistory(code, studentName, hint);

        notifyTeacher(code, "AI_HINT_GENERATED", Map.of(
                "studentName", studentName,
                "hint", hint,
                "timestamp", System.currentTimeMillis()
        ));
        System.out.println("🤖 [AI DELEGATION] Elev: " + studentName);
        System.out.println("   Istoric detectat: " + (history.isEmpty() ? "Niciunul" : history));
        System.out.println("   Răspuns generat: " + hint);

        sendToUser(code, studentName, Map.of(
                "type", "ai_feedback",
                "message", "🇫🇷 Beatrix: " + hint
        ));
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

    private void handleUpdateProgress(JsonNode json, String accessCode) throws Exception {
        String studentName = json.get("username").asText();
        Long sessionId = json.get("sessionId").asLong();
        int taskIndex = json.get("taskIndex").asInt();
        int score = json.get("score").asInt();

        StudentProgress updated = gameSessionService.updateStudentProgress(sessionId, studentName, taskIndex, score);
        notifyTeacher(accessCode, "STUDENT_UPDATE", updated);
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

    private void handleWrongAnswer(JsonNode json, String code) throws Exception {
        String studentName = json.get("username").asText();
        JsonNode detailsNode = json.get("details");

        String detailsStr = detailsNode.isObject() ? detailsNode.toString() : detailsNode.asText();
        int taskIndex = json.get("taskIndex").asInt();

        StudentProgress update = gameSessionService.updateStudentStatus(
                json.get("sessionId").asLong(), studentName, taskIndex, true, detailsStr
        );
        notifyTeacher(code, "STUDENT_UPDATE", update);
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
            System.out.println("📢 [WS DEBUG] Încep broadcast pentru codul: " + accessCode);
            System.out.println("📢 [WS DEBUG] Sesiuni totale în memorie: " + userSessions.size());

            userSessions.forEach((key, session) ->{
                if(key.startsWith(accessCode + "_") && session.isOpen()) {
                    try {
                        synchronized (session) {
                            session.sendMessage(new TextMessage(payload));
                        }
                        System.out.println("✅ [WS DEBUG] Trimis către: " + key);
                    } catch (Exception e) {
                        System.err.println("Eroare la trimiterea notificării de închidere către: " + key);
                    }
                } else {
                    System.out.println("❌ [WS DEBUG] Sesiune închisă pentru: " + key);
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
}