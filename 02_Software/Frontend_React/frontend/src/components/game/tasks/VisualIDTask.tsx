import React from 'react';
import type { VisualIDData } from '../../../types/game';
import { styles } from '../AdventureStyles';

interface Props {
    data: VisualIDData;
    onAnswer: (correct: boolean) => void;
    isDisabled: boolean;
}

const VisualIDTask: React.FC<Props> = ({ data, onAnswer, isDisabled }) => {

    const DEBUG_MODE = true;

    const checkClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 1000;
        const y = ((e.clientY - rect.top) / rect.height) * 1000;
        
        console.log(`📍 COORDONATE DETECTATE: x: ${x}, y: ${y}`);
        const { targetZone } = data;

        const isHit = x >= targetZone.x && x <= (targetZone.x + targetZone.width) &&
            y >= targetZone.y && y <= (targetZone.y + targetZone.height);

        onAnswer(isHit);
    };

    return (
        <div style={styles.visualIdLayer} onClick={checkClick}>
            {DEBUG_MODE && data.targetZone && (
                <div style={{
                    position: 'absolute',
                    left: `${data.targetZone.x / 10}%`,
                    top: `${data.targetZone.y / 10}%`,
                    width: `${data.targetZone.width / 10}%`,
                    height: `${data.targetZone.height / 10}%`,
                    border: '3px dashed #ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    pointerEvents: 'none', 
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    textShadow: '1px 1px 2px black'
                }}>
                    ZONĂ CLICK
                </div>
            )}
        </div>
    );
};

export default VisualIDTask;