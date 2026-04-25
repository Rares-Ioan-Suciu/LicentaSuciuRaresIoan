package ro.uvt.licenta.robot_backend.server.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    private final String MODEL = "gpt-4o-mini";
    private final String ENDPOINT = "https://api.openai.com/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    public String generateAIHint(String studentContext, String taskName, String history) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 1. PERSONALITATEA LUI BEATRIX (Agnostică față de materie)
        String systemPrompt = """
                Ești Beatrix, un asistent educațional robot, prietenos, empatic și puțin amuzant.
                Vorbești cu un elev care s-a blocat la un exercițiu interactiv.
                
                REGULI STRICTE:
                1. Fii scurtă și la obiect (maxim 2-3 propoziții). Vei fi auzită prin Text-to-Speech, deci folosește un limbaj natural.
                2. NU da niciodată răspunsul corect direct! Oferă un indiciu logic, o analogie sau pune o întrebare ajutătoare.
                3. Folosește un ton cald, încurajator (ex: "Ești pe aproape!", "Ai grijă la...").
                4. Adaptează-te materiei automat (dacă vezi cuvinte în franceză, explică reguli de limbă; dacă vezi algoritmi, explică logica).
                5. CRITIC: Dacă vezi în 'Istoric' că elevul a mai primit indicii, SCHIMBĂ abordarea! Fii mai explicită sau dă un exemplu concret ca să nu-l frustrezi.
                """;

        // 2. STRUCTURARE CLARĂ A DATELOR PENTRU AI
        String userMessage = String.format(
                "Exercițiul curent: %s\n\n" +
                        "Contextul și eroarea elevului: %s\n\n" +
                        "Istoric indicii deja oferite: %s\n\n" +
                        "Te rog, oferă-i elevului următorul indiciu în limba română:",
                taskName,
                studentContext,
                (history != null && !history.isBlank()) ? history : "Niciunul (este prima greșeală la acest task)"
        );

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", MODEL);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
        ));
        requestBody.put("temperature", 0.8);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(ENDPOINT, entity, Map.class);
            return extractContentFromResponse(response.getBody());
        } catch (Exception e) {
            System.err.println("[OpenAI Error] " + e.getMessage());
            return "Bip-bop! Momentan am circuitele puțin încurcate. Mai citește o dată cerința cu atenție!";
        }
    }

    private String extractContentFromResponse(Map responseBody) {
        if (responseBody == null || !responseBody.containsKey("choices"))
            return "Hmm, nu sunt sigură cum să explic asta. Mai încearcă o dată!";

        List choices = (List) responseBody.get("choices");
        if (choices == null || choices.isEmpty())
            return "Hmm, nu sunt sigură cum să explic asta. Mai încearcă o dată!";

        Map firstChoice = (Map) choices.get(0);
        Map message = (Map) firstChoice.get("message");
        return (String) message.get("content");
    }
}