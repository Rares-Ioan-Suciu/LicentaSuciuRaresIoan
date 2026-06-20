import { APP_CONFIG } from '../config';

const SESSIONS_API = `${APP_CONFIG.API_BASE_URL}/api/sessions`;

const getToken = () => {
    const t = localStorage.getItem('token');
    return t ? `Bearer ${t}` : '';
};

export const TeacherService = {
    downloadReport: async (sessionId: number) => {
        try {
            const response = await fetch(`${SESSIONS_API}/${sessionId}/export`, {
                method: 'GET',
                headers: { 'Authorization': getToken() }
            });

            if (!response.ok) throw new Error("bad request la report");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `Raport_Sesiunea_${sessionId}.csv`;
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.log("nu merge descarcat raportu", err);
            alert("Eroare la descarcare raport");
        }
    },

    terminateSession: async (sessionId: number) => {
        try {
            const response = await fetch(`${SESSIONS_API}/${sessionId}/terminate`, {
                method: 'DELETE',
                headers: { 'Authorization': getToken() }
            });
            return response.ok;
        } catch (e) {
            console.log("fail la terminare sesiune", e);
            return false;
        }
    },

    createSession: async (levelId: number, teacherName: string) => {
        try {
            const response = await fetch(`${SESSIONS_API}/create?levelId=${levelId}&teacher=${teacherName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getToken()
                }
            });

            if (response.status === 401 || response.status === 403) {
                console.log("token expirat cred");
            }

            return await response.json();
        } catch (err) {
            console.log("eroare la crearea sesiunii noi");
            throw err;
        }
    }
};