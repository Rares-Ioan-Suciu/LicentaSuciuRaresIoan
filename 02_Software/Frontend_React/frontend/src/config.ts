export const APP_CONFIG = {
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://192.168.1.13:8080',
    WS_BASE_URL: import.meta.env.VITE_WS_URL || 'ws://192.168.1.13:8080',
    ROBOT_IP: import.meta.env.VITE_ROBOT_IP || 'http://192.168.1.7'
};