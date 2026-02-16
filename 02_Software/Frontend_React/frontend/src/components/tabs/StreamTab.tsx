import { useState } from 'react';
import useCurrentUser from '../../hooks/useCurrentUser';

interface StreamTabProps {
    classroom: any;
    isTeacher: boolean;
    onPost: (content: string) => void;
}

const StreamTab = ({ classroom, isTeacher, onPost }: StreamTabProps) => {
    const [text, setText] = useState("");
    const user = useCurrentUser();
    if (!user) 
        return null;

    const formatDate = (dateInput: any) => {
        if (!dateInput) return '';
        if (Array.isArray(dateInput)) {
            const [year, month, day, hour, minute, second] = dateInput;
            return new Date(year, month - 1, day, hour, minute, second || 0).toLocaleString('ro-RO');
        }
        return new Date(dateInput).toLocaleString('ro-RO');
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            {isTeacher && (
                <div style={styles.card}>
                    <h4 style={styles.cardTitle}>Anunță ceva!</h4>
                    <textarea
                        value={text} onChange={(e) => setText(e.target.value)}
                        placeholder="Scrie un mesaj pentru clasă..." style={styles.textarea}
                    />
                    <div style={{ textAlign: 'right' }}>
                        <button
                            onClick={() => { if (text) { onPost(text); setText(""); } }}
                            style={text ? styles.actionButton : { ...styles.actionButton, background: '#ccc', cursor: 'not-allowed' }}
                            disabled={!text}
                        >
                            Postează
                        </button>
                    </div>
                </div>
            )}

            <div style={{ ...styles.card, marginTop: 20 }}>
                <h3 style={styles.sectionHeader}>Flux Activitate</h3>

                {classroom.announcements.length === 0 && (
                    <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: 20 }}>
                        Nu există anunțuri încă.
                    </p>
                )}

                {classroom.announcements.map((ann: any) => (
                    <div key={ann.id} style={styles.announcementItem}>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                
                            <strong style={{ color: '#000', fontSize: '1rem' }}>
                                { user.full_name || "USER" }
                            </strong>

                            <span style={{ color: '#888' }}>
                                {formatDate(ann.postedAt || ann.posted_at)}
                            </span>
                        </div>

                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#333', fontSize: '0.95rem' }}>
                            {ann.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    card: { border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', background: '#fff' },
    cardTitle: { marginTop: 0, marginBottom: '15px', fontSize: '1.1rem', color: '#444' },
    textarea: { width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit', marginBottom: '10px', resize: 'vertical' as 'vertical', outline: 'none' },
    actionButton: { padding: '10px 24px', background: '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    sectionHeader: { borderBottom: '2px solid #f1f3f5', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.2rem' },
    announcementItem: { borderBottom: '1px solid #f1f3f5', padding: '20px 0' },
};

export default StreamTab;