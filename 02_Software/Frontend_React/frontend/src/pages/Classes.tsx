import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherNavbar from '../components/TeacherNavbar';
import StudentNavbar from '../components/StudentNavbar';
import useCurrentUser from '../hooks/useCurrentUser';

interface Classroom {
  id: string;
  name: string;
  description: string;
}

const Classes = () => {
  const navigate = useNavigate();
  const user = useCurrentUser(); 
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token'); 

  const fetchClasses = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/classes', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async () => {
    const name = prompt("Numele clasei:");
    if (!name) return;
    const desc = prompt("Descriere (optional):") || "";

    try {
      const res = await fetch('http://localhost:8080/api/v1/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ name: name, description: desc })
      });
      
      if (res.ok) {
        fetchClasses();
      } else {
        alert("Eroare la crearea clasei");
      }
    } catch (error) {
      console.error(error);
    }
  };


  if (!user) return null; 

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#f8f9fa' }}>
      
      {}
      {user.role === 'teacher' ? <TeacherNavbar /> : <StudentNavbar />}

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0 }}>Clasele mele</h1>
          
          {}
          {user.role === 'teacher' && (
            <button 
              onClick={handleCreateClass}
              style={{ padding: '12px 24px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold'}}
            >
              + Creeză o clasă nouă
            </button>
          )}
        </div>

        {loading ? <p>Se încarcă clasa...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
            {classes.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', marginTop: '40px' }}>
                    <p>Nicio clasă găsită.</p>
                </div>
            )}
            {classes.map((cls) => (
              <div 
                key={cls.id} 
                onClick={() => navigate(`/classes/${cls.id}`)}
                style={{ 
                  background: 'white',
                  border: '1px solid #eee', 
                  borderRadius: '12px', 
                  padding: '25px', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s',
                  display: 'flex', flexDirection: 'column', gap: '10px'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #007bff, #6610f2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white', marginBottom: '5px' }}>
                    
                </div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{cls.name}</h2>
                <p style={{ margin: 0, color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {cls.description || "No description provided."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;