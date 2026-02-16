import { useState } from 'react';

interface PeopleTabProps {
    students: any[];
    isTeacher: boolean;
    onInvite: (email: string) => void;
}

const PeopleTab = ({ students, isTeacher, onInvite }: PeopleTabProps) => {
    const [email, setEmail] = useState("");

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={styles.card}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: 15 }}>
                    Studenți ({students.length})
                </h3>

                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {students.map(s => (
                        <li key={s.id} style={styles.studentRow}>
                            <div style={styles.avatar}>
                                {s.fullName ? s.fullName.charAt(0) : 'S'}
                            </div>
                            <span style={{ fontWeight: 500 }}>{s.fullName}</span>
                        </li>
                    ))}
                    {students.length === 0 && (
                        <li style={{ color: '#999', fontStyle: 'italic', padding: 20, textAlign: 'center' }}>
                            Niciun student înscris.
                        </li>
                    )}
                </ul>

                {isTeacher && (
                    <div style={{ marginTop: 30, paddingTop: 20, borderTop: '2px dashed #eee' }}>
                        <h4 style={{ marginTop: 0 }}>Invită Student</h4>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <input
                                value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="Email student..."
                                style={styles.input}
                            />
                            <button
                                onClick={() => { onInvite(email); setEmail(""); }}
                                style={styles.btn}
                            >
                                Invită
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    card: { border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', flex: 1, outline: 'none' },
    btn: { padding: '12px 24px', background: '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    studentRow: { padding: '12px 0', borderBottom: '1px solid #f9f9f9', display: 'flex', alignItems: 'center', gap: 15 },
    avatar: { width: 36, height: 36, background: '#6c757d', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }
};

export default PeopleTab;