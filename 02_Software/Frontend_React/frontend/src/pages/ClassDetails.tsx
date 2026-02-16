import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useCurrentUser from '../hooks/useCurrentUser';
import TeacherNavbar from '../components/TeacherNavbar';
import StudentNavbar from '../components/StudentNavbar';
import StreamTab from '../components/tabs/StreamTab';
import PeopleTab from '../components/tabs/PeopleTab';
import GameTab from '../components/tabs/GameTab';

interface ClassroomData {
    id: number;
    name: string;
    description: string;
    announcements: any[];
}

const ClassDetails = () => {
    const { id } = useParams();
    const user = useCurrentUser();
    const token = localStorage.getItem('token');
    const [activeTab, setActiveTab] = useState<'stream' | 'people' | 'game'>('stream');

    const [classroom, setClassroom] = useState<ClassroomData | null>(null);
    const [students, setStudents] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/v1/classes/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (!data.announcements) data.announcements = [];
                data.announcements.reverse();
                setClassroom(data);
            }
            const resStudents = await fetch(`http://localhost:8080/api/v1/classes/${id}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resStudents.ok) {
                setStudents(await resStudents.json() || []);
            }

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (id && token) fetchData();
    }, [id, user]);
    const handlePost = async (content: string) => {
        if (!content) return;
        await fetch(`http://localhost:8080/api/v1/classes/${id}/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content })
        });
        fetchData();
    };
    const handleInvite = async (email: string) => {
        if (!email) return;
        const res = await fetch(`http://localhost:8080/api/v1/classes/${id}/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ email })
        });

        if (res.ok) {
            alert("Student invitat cu succes!");
            fetchData();
        } else {
            alert("Eroare: Studentul nu a fost găsit.");
        }
    };

    if (!classroom) return <div style={{ padding: 40, textAlign: 'center' }}>Se încarcă clasa...</div>;

    const isTeacher = user?.role === 'teacher';

    return (
        <div style={styles.pageContainer}>
            {isTeacher ? <TeacherNavbar /> : <StudentNavbar />}
            <div style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>{classroom.name}</h1>
                    <p style={styles.heroDesc}>{classroom.description}</p>
                </div>
            </div>

            <div style={styles.tabBar}>
                <div style={styles.tabContainer}>
                    <button
                        onClick={() => setActiveTab('stream')}
                        style={activeTab === 'stream' ? styles.activeTab : styles.tab}
                    >
                     Discuții
                    </button>
                    <button
                        onClick={() => setActiveTab('people')}
                        style={activeTab === 'people' ? styles.activeTab : styles.tab}
                    >
                    Studenți
                    </button>

                    <button
                        onClick={() => setActiveTab('game')}
                        style={activeTab === 'game' ? styles.activeTab : styles.tab}
                    >
                        Joc
                    </button>
                </div>
            </div>

            <div style={styles.mainContent}>
                {activeTab === 'stream' && (
                    <StreamTab
                        classroom={classroom}
                        isTeacher={isTeacher}
                        onPost={handlePost}
                    />
                )}
                {activeTab === 'people' && (
                    <PeopleTab
                        students={students}
                        isTeacher={isTeacher}
                        onInvite={handleInvite}
                    />
                )}

                {activeTab === 'game' && (
                    <GameTab isTeacher={isTeacher} />
                )}
            </div>
        </div>
    );
};

const styles = {
    pageContainer: { fontFamily: 'Inter, sans-serif', backgroundColor: '#fff', minHeight: '100vh', color: '#333' },
    hero: { background: '#000', color: 'white', padding: '40px 20px' },
    heroContent: { maxWidth: '1000px', margin: '0 auto' },
    heroTitle: { margin: 0, fontSize: '2.5rem', fontWeight: 700 },
    heroDesc: { margin: '10px 0 0 0', fontSize: '1.1rem', opacity: 0.8 },
    tabBar: { borderBottom: '1px solid #e0e0e0', background: '#fff', position: 'sticky' as 'sticky', top: 0, zIndex: 10 },
    tabContainer: { maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '30px', padding: '0 20px' },
    tab: { background: 'none', border: 'none', borderBottom: '3px solid transparent', padding: '15px 5px', fontSize: '1rem', color: '#666', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' },
    activeTab: { background: 'none', border: 'none', borderBottom: '3px solid #000', padding: '15px 5px', fontSize: '1rem', color: '#000', cursor: 'pointer', fontWeight: 700 },
    mainContent: { maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' },
};

export default ClassDetails;