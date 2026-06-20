import axios from 'axios';
import { APP_CONFIG } from '../config';

const api = axios.create({
    baseURL: `${APP_CONFIG.API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;