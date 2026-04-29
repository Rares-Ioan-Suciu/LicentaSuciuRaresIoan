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

    /**
     * Generează un indiciu inteligent.
     * @param language Limba dorită: "fr" pentru franceză (bilingv), "ro" pentru română.
     */
    public String generateAIHint(String studentContext, String taskName, String history, String language) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // BEATRIX BILINGVĂ
        String systemPrompt = """
                Tu es Beatrix, un robot assistant éducatif, amical et encourageant. 
                
                REGULI STRICTE DE COMUNICARE:
                1. DACA LIMBA ESTE 'fr' (FRANCEZĂ):
                   - Răspunde OBLIGATORIU BILINGV (Franceză și Română).
                   - FORMAT STRICT: Scrie indiciul în franceză, pune un singur simbol '|', apoi scrie traducerea sau explicația în română.
                   - Exemplu: "Regarde bien la fin du mot ! | Uită-te cu atenție la finalul cuvântului!"
                   - Tonul trebuie să fie entuziast.
                
                2. DACA LIMBA ESTE 'ro' (ROMÂNĂ):
                   - Răspunde EXCLUSIV în limba ROMÂNĂ.
                   - NU folosi deloc simbolul '|'.
                
                3. REGULI GENERALE:
                   - Fii scurtă: maxim o propoziție în limba 1, o propoziție în limba 2.
                   - NU da niciodată răspunsul corect direct! Oferă o pistă de gândire, o regulă sau o analogie.
                """;

        String userMessage = String.format(
                "MATERIA/LIMBA SOLICITATĂ: %s\n" +
                        "EXERCIȚIU: %s\n" +
                        "EROAREA ELEVULUI ȘI CONTEXTUL: %s\n" +
                        "ISTORIC INDICII: %s\n\n" +
                        "Te rog, Beatrix, oferă-i elevului indiciul respectând strict formatul cerut:",
                language.equals("fr") ? "FRANCEZĂ (BILINGV)" : "ROMÂNĂ",
                taskName,
                studentContext,
                (history != null && !history.isBlank()) ? history : "Prima greșeală."
        );

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", MODEL);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
        ));
        requestBody.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(ENDPOINT, entity, Map.class);
            return extractContentFromResponse(response.getBody());
        } catch (Exception e) {
            System.err.println("[OpenAI Error] " + e.getMessage());
            return language.equals("fr") ?
                    "Bip-bop ! Erreur de connexion. | Bip-bop! Am o eroare de conexiune, mai încearcă o dată!" :
                    "Bip-bop! Am circuitele puțin încurcate. Mai încearcă o dată!";
        }
    }

    private String extractContentFromResponse(Map responseBody) {
        if (responseBody == null || !responseBody.containsKey("choices")) return "...";
        List choices = (List) responseBody.get("choices");
        Map firstChoice = (Map) choices.get(0);
        Map message = (Map) firstChoice.get("message");
        return (String) message.get("content");
    }
}