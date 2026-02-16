package ro.uvt.licenta.robot_backend.server.config;

import ro.uvt.licenta.robot_backend.server.controller.GameSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import ro.uvt.licenta.robot_backend.server.service.OpenAIService;

@Configuration
@EnableWebSocket

public class WebSocketConfig implements WebSocketConfigurer {

    private final OpenAIService openAIService;

    public WebSocketConfig(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry){
        registry.addHandler(gameHandler(openAIService), "/ws_game").setAllowedOrigins("*");

    }

    @Bean
    public GameSocketHandler gameHandler(OpenAIService openAIService){
        return new GameSocketHandler(openAIService);
    }
}
