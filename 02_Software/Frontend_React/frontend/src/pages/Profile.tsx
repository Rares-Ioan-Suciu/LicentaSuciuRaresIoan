import { useState, useEffect } from 'react';
import useCurrentUser from '../hooks/useCurrentUser';
import TeacherNavbar from '../components/TeacherNavbar';
import StudentNavbar from '../components/StudentNavbar';

const COLORS = [
 "#F9FAFB", "#F3F4F6", "#E5E7EB", "#D1D5DB", "#9CA3AF", "#6B7280", "#4B5563", "#374151", "#1F2937", "#111827",
  "#FEE2E2", "#FCA5A5", "#F87171", "#EF4444", "#DC2626",
  "#FFEDD5", "#FDBA74", "#FB923C", "#F97316", "#EA580C",
  "#FEF9C3", "#FDE047", "#FACC15", "#EAB308", "#CA8A04",
  "#DCFCE7", "#86EFAC", "#4ADE80", "#22C55E", "#16A34A",
  "#DBEAFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB",
  "#EDE9FE", "#C4B5FD", "#A78BFA", "#8B5CF6",
];

const Profile = () => {
  const user = useCurrentUser();
  const token = localStorage.getItem('token');

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarColor, setAvatarColor] = useState("#ff80ed");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.sub);
      if (user.avatar_color) setAvatarColor(user.avatar_color);
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/me', {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            full_name: fullName,
            email: email,
            avatar_color: avatarColor
        })
      });

      if (res.ok) {
        alert("ID Card Updated!");
        window.location.reload(); 
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (!user) return <div style={{padding: 40}}>Loading Identity...</div>;

  return (
    <div style={styles.pageContainer}>
      {user.role === 'teacher' ? <TeacherNavbar /> : <StudentNavbar />}

      <div style={styles.content}>
        <h1 style={styles.title}>My Identity</h1>
        <div style={styles.idCard}>
            <div style={styles.avatarSection}>
                <div style={{...styles.avatarCircle, backgroundColor: avatarColor}}>
                    {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.roleBadge}>{user.role.toUpperCase()}</div>
            </div>
            <div style={styles.formSection}>
                <div style={styles.inputGroup}>
                    <label htmlFor="fullName" style={styles.label}>Full Name</label>
                    <input 
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="email" style={styles.label}>Email Address</label>
                    <input 
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label id="color-label" style={styles.label}>ID Color</label>
                    <div style={styles.colorGrid} role="group" aria-labelledby="color-label">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setAvatarColor(c)}
                                aria-label={`Select color ${c}`}
                                style={{
                                    ...styles.colorSwatch,
                                    backgroundColor: c,
                                    border: avatarColor === c ? '3px solid #333' : '3px solid transparent'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div style={styles.actions}>
                    <button 
                        type="button" 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        style={styles.saveBtn}
                    >
                        {isSaving ? "Updating..." : "Save Changes"}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={handleLogout} 
                        style={styles.logoutBtn}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
    pageContainer: {
        minHeight: '100vh',
        background: '#fafafa',
        fontFamily: '-apple-system, sans-serif',
        color: '#333'
    },
    content: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '30px',
        fontWeight: '800',
        letterSpacing: '-1px'
    },
    idCard: {
        background: '#fff',
        border: '2px solid #000',
        borderRadius: '12px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'row' as 'row',
        gap: '50px',
        boxShadow: '8px 8px 0px #000',
    },
    avatarSection: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        gap: '20px'
    },
    avatarCircle: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        fontWeight: 'bold',
        color: '#fff',
        border: '3px solid #000'
    },
    roleBadge: {
        background: '#000',
        color: '#fff',
        padding: '5px 15px',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        letterSpacing: '1px'
    },
    formSection: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        fontSize: '0.9rem',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#555'
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '1rem',
        border: '2px solid #ddd',
        borderRadius: '6px',
        outline: 'none',
        fontWeight: '500',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box' as 'border-box'
    },
    colorGrid: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap' as 'wrap',
    },
    colorSwatch: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        cursor: 'pointer'
    },
    actions: {
        marginTop: '30px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center'
    },
    saveBtn: {
        background: '#000',
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: 'bold',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    logoutBtn: {
        background: 'transparent',
        color: '#d32f2f',
        border: 'none',
        padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        textDecoration: 'underline'
    }
};

export default Profile;