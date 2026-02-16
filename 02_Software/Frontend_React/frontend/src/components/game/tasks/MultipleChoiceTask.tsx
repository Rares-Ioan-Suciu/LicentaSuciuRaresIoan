import React from 'react';

interface MultipleChoiceProps {
    data: { options: string[], correctAnswer: string };
    onAnswer: (answer: string) => void;
    isDisabled: boolean;
}

const MultipleChoiceTask: React.FC<MultipleChoiceProps> = ({ data, onAnswer, isDisabled }) => {
    return (
        <div style={styles.grid}>
            {data.options.map((option, index) => (
                <button
                    key={index}
                    disabled={isDisabled}
                    onClick={() => onAnswer(option)}
                    style={isDisabled ? styles.buttonDisabled : styles.button}
                >
                    <span style={styles.index}>{String.fromCharCode(65 + index)}</span>
                    {option}
                </button>
            ))}
        </div>
    );
};

const styles = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%', maxWidth: '500px' },
    button: {
        padding: '15px 20px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
        background: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px',
        display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s',
        boxShadow: '0 4px 0 #e2e8f0'
    },
    buttonDisabled: { padding: '15px 20px', background: '#f1f5f9', color: '#94a3b8', borderRadius: '12px', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' },
    index: { background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b' }
};

export default MultipleChoiceTask;