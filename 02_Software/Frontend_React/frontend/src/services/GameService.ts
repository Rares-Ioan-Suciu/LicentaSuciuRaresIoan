import axios from 'axios';
import type { GameTask, GameLevel } from '../types/game';
import { APP_CONFIG } from '../config';

const GAME_API = `${APP_CONFIG.API_BASE_URL}/api/game`;

export const GameService = {
    getAllLevels: async (): Promise<GameLevel[]> => {
        try {
            const { data } = await axios.get(`${GAME_API}/levels`);
            return data;
        } catch (err) {
            console.log("nu a mers sa iau nivelele", err);
            throw new Error("Eroare la incarcare nivele");
        }
    },

    getLevelTasks: async (levelId: number): Promise<GameTask[]> => {
        try {
            const { data } = await axios.get(`${GAME_API}/levels/${levelId}/tasks`);

            return data.map((task: any) => {
                try {
                    return {
                        ...task,
                        parsedData: typeof task.taskData === 'string' ? JSON.parse(task.taskData) : task.taskData
                    };
                } catch (e) {
                    console.log("eroare parsare json la task", task.id);
                    return task;
                }
            });
        } catch (err) {
            throw err;
        }
    }
};