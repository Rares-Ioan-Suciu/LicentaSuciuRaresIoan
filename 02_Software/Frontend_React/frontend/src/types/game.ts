export type TaskType = 'MultipleChoice' | 'DragAndDrop' | 'SentenceBuilder' | 'VisualID';

export interface MultipleChoiceData {
    options: string[];
    correctAnswer: string;
}

export interface DragDropData {
    items: { id: string; text: string; category: string }[];
    zones: string[];
}

export interface SentenceBuilderData {
    words: string[];
    correctOrder: string[];
}

export interface VisualIDData {
    targetZone: { x: number; y: number; width: number; height: number };
   
}

export interface GameTask {
    id: number;
    type: TaskType;
    requirement: string;
    orderIndex: number;
    taskData: string; 
    parsedData?: any;
    imageUrl?: string;  
    aiHintContext?: string;
}

export interface GameLevel {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    difficulty: number;
}