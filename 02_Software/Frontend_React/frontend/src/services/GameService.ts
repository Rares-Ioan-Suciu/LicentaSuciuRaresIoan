import axios from 'axios'; 
import type { GameTask, GameLevel } from '../types/game';

const BASE_URL = 'http://localhost:8080/api/game';

export const GameService = {
    getAllLevels: async (): Promise<GameLevel[]> => {
        const response = await axios.get(`${BASE_URL}/levels`);
        return response.data;
    },

    getLevelTasks: async (levelId: number): Promise<GameTask[]> => {
        const response = await axios.get(`${BASE_URL}/levels/${levelId}/tasks`);

        return response.data.map((task: any) => {
            try {
                return {
                    ...task,
                    parsedData: typeof task.taskData === 'string' ? JSON.parse(task.taskData) : task.taskData
                };
            } catch (e) {
                console.error("Eroare parsare date task:", task.id);
                return task;
            }
        });
    }
};