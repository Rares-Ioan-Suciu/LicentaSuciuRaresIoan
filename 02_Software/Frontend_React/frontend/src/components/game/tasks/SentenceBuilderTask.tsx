import React, { useState, useMemo } from 'react';
import { styles } from '../AdventureStyles';

interface SentenceData {
    words: string[];       
    correctSentence?: string;
    correctOrder?: string[]; 
}

interface Props {
    data: SentenceData;
    onAnswer: (isCorrect: boolean) => void;
    isDisabled: boolean;
}

const SentenceBuilderTask: React.FC<Props> = ({ data, onAnswer, isDisabled }) => {
    const [selectedWords, setSelectedWords] = useState<{ word: string, originalIndex: number }[]>([]);

    const availableWords = useMemo(() => {
        const selectedIndices = selectedWords.map(s => s.originalIndex);
        return data.words.map((word, index) => ({ word, index }))
            .filter(item => !selectedIndices.includes(item.index));
    }, [data.words, selectedWords]);

    const targetSentence = useMemo(() => {
        if (data.correctSentence) return data.correctSentence.trim();
        if (data.correctOrder) return data.correctOrder.join(' ').trim();
        return "";
    }, [data.correctSentence, data.correctOrder]);

    const addWord = (word: string, originalIndex: number) => {
        if (isDisabled) return;
        setSelectedWords([...selectedWords, { word, originalIndex }]);
    };

    const removeWord = (indexInSelected: number) => {
        if (isDisabled) return;
        const newSelected = [...selectedWords];
        newSelected.splice(indexInSelected, 1);
        setSelectedWords(newSelected);
    };

    const handleVerify = () => {
        if (isDisabled || selectedWords.length === 0) return;

        const currentAttempt = selectedWords.map(s => s.word).join(' ').trim();

        console.log("Attempt:", `"${currentAttempt}"`);
        console.log("Target:", `"${targetSentence}"`);

        onAnswer(currentAttempt === targetSentence);
    };

    return (
        <div style={styles.sentenceContainer}>
            <div style={styles.sentenceDisplay}>
                {selectedWords.length === 0 && (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Formează propoziția apăsând pe cuvinte...</span>
                )}
                {selectedWords.map((item, i) => (
                    <div
                        key={`selected-${i}`}
                        style={styles.wordBubble}
                        onClick={() => removeWord(i)}
                    >
                        {item.word}
                    </div>
                ))}
            </div>

            <div style={{ ...styles.itemsPool, border: 'none', backgroundColor: 'transparent', minHeight: 'auto' }}>
                {availableWords.map((item) => (
                    <div
                        key={`avail-${item.index}`}
                        style={isDisabled ? styles.wordBubbleEmpty : styles.wordBubble}
                        onClick={() => addWord(item.word, item.index)}
                    >
                        {item.word}
                    </div>
                ))}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                    onClick={() => setSelectedWords([])}
                    disabled={isDisabled || selectedWords.length === 0}
                    style={{ ...styles.menuBtn, backgroundColor: '#64748b', fontSize: '0.9rem' }}
                >
                    Reset
                </button>

                <button
                    onClick={handleVerify}
                    disabled={isDisabled || selectedWords.length === 0}
                    style={{
                        ...styles.menuBtn,
                        backgroundColor: (isDisabled || selectedWords.length === 0) ? '#94a3b8' : '#1e293b'
                    }}
                >
                    {isDisabled ? 'Se verifică...' : 'Verifică Propoziția'}
                </button>
            </div>
        </div>
    );
};

export default SentenceBuilderTask;