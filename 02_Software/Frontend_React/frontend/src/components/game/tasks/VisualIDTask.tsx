import React from 'react';
import type { VisualIDData } from '../../../types/game';
import { styles } from '../AdventureStyles';

interface Props {
    data: VisualIDData;
    onAnswer: (correct: boolean) => void;
    isDisabled: boolean;
}

const VisualIDTask: React.FC<Props> = ({ data, onAnswer, isDisabled }) => {

    const SHOW_HINT_GLOW = true;

    const checkClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 1000;
        const y = ((e.clientY - rect.top) / rect.height) * 1000;

        console.log(`Coordonate apasate: x: ${x}, y: ${y}`);
        const { targetZone } = data;

        const isHit = x >= targetZone.x && x <= (targetZone.x + targetZone.width) &&
            y >= targetZone.y && y <= (targetZone.y + targetZone.height);

        onAnswer(isHit);
    };

    return (
        <div style={styles.visualIdLayer} onClick={checkClick}>
            {SHOW_HINT_GLOW && data.targetZone && (
                <>
                    <style>
                        {`
                            @keyframes subtleGlow {
                                0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }
                                50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.5); border-color: rgba(255, 255, 255, 0.6); }
                                100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }
                            }
                        `}
                    </style>
                    <div style={{
                        position: 'absolute',
                        left: `${data.targetZone.x / 10}%`,
                        top: `${data.targetZone.y / 10}%`,
                        width: `${data.targetZone.width / 10}%`,
                        height: `${data.targetZone.height / 10}%`,
                        border: '1px solid rgba(255, 255, 255, 0.2)', 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: '8px', 
                        pointerEvents: 'none', 
                        zIndex: 10,
                        animation: 'subtleGlow 2.5s infinite ease-in-out', 
                    }}>
                    </div>
                </>
            )}
        </div>
    );
};

export default VisualIDTask;