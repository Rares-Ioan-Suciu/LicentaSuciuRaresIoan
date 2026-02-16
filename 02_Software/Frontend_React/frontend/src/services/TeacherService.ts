const API_URL = "http://localhost:8080/api/sessions";

export const TeacherService = {
    downloadReport: async (sessionId: number) => {
        window.location.href = `${API_URL}/${sessionId}/export`;
    },

    terminateSession: async (sessionId : number) => {
        const response = await fetch(`${API_URL}/${sessionId}/terminate`, {
            method: 'DELETE'
        });
        return response.ok;
    }, 

    createSession: async (levelId: number, teacherName: string) => {
        
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/create?levelId=${levelId}&teacher=${teacherName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        if (response.status === 403) {
            console.error("Acces interzis! Verifică SecurityConfig sau validitatea token-ului.");
        }

        return await response.json();
    }

};