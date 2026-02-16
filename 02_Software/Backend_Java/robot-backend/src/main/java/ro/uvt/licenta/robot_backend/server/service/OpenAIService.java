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

    public String generateAIHint(String studentError, String taskName, String history) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String systemPrompt = String.format(
                "Ești un profesor expert de limba franceză integrat într-un asistent educațional. " +
                        "Sarcina ta este să analizezi eroarea elevului la exercițiul: %s.\n\n" +
                        "REGULI DE AUR:\n" +
                        "1. Vorbește strict despre limba franceză (gen, număr, conjugare, vocabular).\n" +
                        "2. NU da răspunsul direct sub nicio formă.\n" +
                        "3. Oferă un indiciu socratic în limba română, scurt și clar (max 15 cuvinte).\n" +
                        "4. Folosește terminologie pedagogică simplă (ex: 'acordul adjectivului', 'articol masculin').\n\n" +
                        "CONTEXT: %s",
                taskName, studentError
        );

        String userMessage = String.format("Am făcut următoarea eroare: '%s'. Ajută-mă!", studentError);

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
            e.printStackTrace();
            return "Bip-bop! Momentan am circuitele ocupate. Mai încearcă o dată!";
        }
    }

    private String extractContentFromResponse(Map responseBody) {
        if (responseBody == null || !responseBody.containsKey("choices"))
            return "Nu am putut genera un indiciu.";

        List choices = (List) responseBody.get("choices");
        if (choices == null || choices.isEmpty())
            return "Nu am putut genera un indiciu.";

        Map firstChoice = (Map) choices.get(0);
        Map message = (Map) firstChoice.get("message");
        return (String) message.get("content");
    }
}