const API_URL = "http://localhost:8080/api/sessions";

export const TeacherService = {
    downloadReport: async (sessionId: number) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${sessionId}/export`, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        if (!response.ok) {
            throw new Error("Eroare la generarea raportului de la server!");
        }

        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `Raport_Sesiune_${sessionId}.csv`;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
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