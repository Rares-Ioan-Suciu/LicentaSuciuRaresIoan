import React, { useState } from 'react';
import { styles } from '../AdventureStyles';

interface DndItem {
    id: string;
    text: string;
    category: string;
}

interface DragDropProps {
    data: { items: DndItem[]; zones: string[] };
    onAnswer: (isCorrect: boolean) => void;
    isDisabled: boolean;
}

const DragAndDropTask: React.FC<DragDropProps> = ({ data, onAnswer, isDisabled }) => {
    const [placedItems, setPlacedItems] = useState<Record<string, DndItem[]>>(
        data.zones.reduce((acc, zone) => ({ ...acc, [zone]: [] }), {})
    );
    const [pool, setPool] = useState<DndItem[]>(data.items);

    const totalPlaced = Object.values(placedItems).flat().length;
    const isAllPlaced = totalPlaced === data.items.length;

    const handleMove = (itemId: string, targetZone: string | 'pool') => {
        if (isDisabled) return;
        const item = data.items.find(i => i.id === itemId);
        if (!item) return;

        setPool(prev => prev.filter(i => i.id !== itemId));
        setPlacedItems(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(z => next[z] = next[z].filter(i => i.id !== itemId));

            if (targetZone === 'pool') {
                setPool(currentPool => [...currentPool, item]);
            } else {
                next[targetZone] = [...next[targetZone], item];
            }
            return next;
        });
    };

    const onDragStart = (e: React.DragEvent, itemId: string) => {
        if (isDisabled) return;
        e.dataTransfer.setData("itemId", itemId);
    };

    const submit = () => {
        if (isDisabled || !isAllPlaced) return;
        const isAllCorrect = data.items.every(item =>
            placedItems[item.category]?.some(i => i.id === item.id)
        );
        onAnswer(isAllCorrect);
    };

    return (
        <div style={{ ...styles.dndContainer, paddingBottom: '20px' }}>
            <div
                style={styles.itemsPool}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleMove(e.dataTransfer.getData("itemId"), 'pool')}
            >
                {pool.map(item => (
                    <div
                        key={item.id}
                        draggable={!isDisabled}
                        onDragStart={(e) => onDragStart(e, item.id)}
                        style={styles.dragItem}
                    >
                        {item.text}
                    </div>
                ))}
                {pool.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Toate produsele sunt aranjate!</span>}
            </div>

            <div style={styles.dropZonesContainer}>
                {data.zones.map(zone => (
                    <div
                        key={zone}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleMove(e.dataTransfer.getData("itemId"), zone)}
                        style={{
                            ...styles.dropZone,
                            borderColor: placedItems[zone].length > 0 ? '#3b82f6' : '#cbd5e1'
                        }}
                    >
                        <div style={styles.dropZoneTitle}>{zone}</div>
                        {placedItems[zone].map(item => (
                            <div
                                key={item.id}
                                draggable={!isDisabled}
                                onDragStart={(e) => onDragStart(e, item.id)}
                                onClick={() => handleMove(item.id, 'pool')}
                                style={{
                                    ...styles.dragItem,
                                    cursor: isDisabled ? 'default' : 'grab',
                                    backgroundColor: '#fff',
                                    border: '2px solid #e2e8f0'
                                }}
                            >
                                {item.text}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {isAllPlaced && (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px' }}>
                    <button
                        onClick={submit}
                        disabled={isDisabled}
                        style={{
                            ...styles.menuBtn,
                            backgroundColor: isDisabled ? '#94a3b8' : '#10b981', 
                            color: '#ffffff', 
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            padding: '12px 30px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            boxShadow: isDisabled ? 'none' : '0 4px 6px -1px rgba(16, 185, 129, 0.4)'
                        }}
                    >
                        {isDisabled ? 'Se verifică...' : 'Validează răspunsul'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default DragAndDropTask;