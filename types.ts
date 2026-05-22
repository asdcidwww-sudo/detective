export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface Suspect {
  id: number;
  name: string;
  description: string;
  motive: string; // Detailed background/motive story
  dnaProfile: number[]; // Array of band positions (0-100)
  avatarPrompt: string; // Prompt to generate their face
}

export enum GameStep {
  INTRO = 'INTRO',
  SCENE_INVESTIGATION = 'SCENE_INVESTIGATION', // Formerly COLLECTION
  THEORY_QUIZ = 'THEORY_QUIZ',
  EXTRACTION = 'EXTRACTION',
  PCR_GEL = 'PCR_GEL',
  ANALYSIS = 'ANALYSIS',
  CONCLUSION = 'CONCLUSION',
  SKETCH_ARTIST = 'SKETCH_ARTIST'
}

export type ImageSize = '1K' | '2K' | '4K';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string; // Used by Holmes to explain why it's right or wrong
}

export interface StoryStage {
  id: GameStep;
  title: string;
  backgroundPrompt: string;
  narrative: string;
  task: string;
  quiz?: {
    question: string;
    options: QuizOption[];
  };
}