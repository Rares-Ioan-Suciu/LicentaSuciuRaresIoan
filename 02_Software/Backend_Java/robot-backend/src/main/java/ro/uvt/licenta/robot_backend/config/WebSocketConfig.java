package ro.uvt.licenta.robot_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import ro.uvt.licenta.robot_backend.server.controller.GameSocketHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final GameSocketHandler gameSocketHandler;

    public WebSocketConfig(GameSocketHandler gameSocketHandler) {
        this.gameSocketHandler = gameSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(gameSocketHandler, "/ws_game")
                .setAllowedOrigins("*");
    }
}