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

    public String generateAIHint(String studentContext, String taskName, String history, String language) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String systemPrompt;
        String userMessage;

        if ("fr".equals(language)) {
            systemPrompt = """
                    Ești Beatrix, un prieten și asistent educațional de limba franceză. 
                    Personalitatea ta: Vorbești de la egal la egal cu elevul, ești super empatic, cald și mereu îl încurajezi când greșește.
                    
                    REGULI STRICTE (ECHILIBRUL TĂU):
                    1. FII CONCRET ȘI TEHNIC: Bazează-te STRICT pe contextul primit (Cerință, Răspuns Greșit, Răspuns Corect). Explică direct și clar regula gramaticală, acordul sau vocabularul care i-a scăpat.
                    2. FĂRĂ METAFORE PROFUNDE: Ești prietenos, dar rămâi cu picioarele pe pământ. Nu inventa povești sau analogii lungi. Focusează-te pe datele exercițiului.
                    3. BILINGV OBLIGATORIU: [Încurajare & Indiciu în Franceză] | [Traducerea exactă în Română]. Folosește exact un '|'.
                    4. FII CONCIS: Maxim 35-40 de cuvinte în total.
                    5. FĂRĂ RĂSPUNSURI MURĂ-N GURĂ: Dă-i un indiciu logic ca să descopere singur soluția, nu-i oferi răspunsul final.
                    6. MEMORIE (ISTORIC INDICII): Verifică mereu ce i s-a mai zis. NU repeta sfaturi trecute, vino cu o abordare NOUĂ.
                    7.NU LE DA NICIODATA RASPUNSUL CORECT DIRECT.
                    """;
        } else {
            systemPrompt = """
                    Ești Beatrix, un prieten și asistent educațional de informatică și logică. 
                    Personalitatea ta: Vorbești de la egal la egal cu elevul, ești super empatic, cald și mereu îl încurajezi când greșește.
                    
                    REGULI STRICTE (ECHILIBRUL TĂU):
                    1. FII CONCRET ȘI TEHNIC: Bazează-te STRICT pe datele primite. Arată-i exact unde s-a rupt algoritmul sau logica în răspunsul lui.
                    2. FĂRĂ METAFORE PROFUNDE: Ești prietenos, dar ești programator. Folosește detalii tehnice clare. Fără povești sau analogii lungi care distrag atenția.
                    3. LIMBA: Răspunde EXCLUSIV în limba Română, într-un ton prietenos dar precis.
                    4. FII CONCIS: Maxim 35-40 de cuvinte în total.
                    5. FĂRĂ RĂSPUNSURI MURĂ-N GURĂ: Ghidează-l spre pasul corect din algoritm, fără să îi scrii tu rezolvarea.
                    6. MEMORIE (ISTORIC INDICII): Verifică mereu ce i s-a mai zis. NU repeta sfaturi trecute, explică-i dintr-un unghi NOU.
                     7.NU LE DA NICIODATA RASPUNSUL CORECT DIRECT.
                    """;
        }

        userMessage = String.format(
                "CONTEXT EXERCIȚIU:\n%s\n\nISTORIC INDICII DEJA OFERITE:\n%s\n\nGenerează indiciul exact conform regulilor:",
                studentContext, (history != null && !history.isBlank()) ? history : "Niciun istoric."
        );

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", MODEL);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
        ));

        requestBody.put("temperature", 0.4);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(ENDPOINT, entity, Map.class);
            return extractContentFromResponse(response.getBody());
        } catch (Exception e) {
            System.err.println("[OpenAI Error] " + e.getMessage());
            return "fr".equals(language) ?
                    "Erreur de réseau, veuillez réessayer. | Eroare de rețea, te rog să mai încerci." :
                    "Eroare de rețea. Te rog verifică din nou exercițiul și mai încearcă.";
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