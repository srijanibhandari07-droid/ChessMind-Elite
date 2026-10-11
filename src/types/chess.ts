import { Square, PieceSymbol, Color } from 'chess.js';

export type ScreenId = 'home' | 'play' | 'academy' | 'openings' | 'thinking' | 'voice' | 'review';

export type MentorId =
  | 'magnus'
  | 'kasparov'
  | 'anand'
  | 'polgar'
  | 'nakamura'
  | 'capablanca'
  | 'fischer'
  | 'tal'
  | 'karpov';

export type CoachingIntensity = 'quiet' | 'balanced' | 'intensive';

export interface MentorProfile {
  id: MentorId;
  name: string;
  title: string;
  era: string;
  avatarSeed: string;
  voiceName: string;
  quote: string;
  philosophies: string[];
  strategicStrength: string;
  curriculumFocus: string;
  bio: string;
  colorScheme: {
    accent: string;
    bgSubtle: string;
    badge: string;
  };
}

export interface EngineEvaluationResult {
  score: number; // centipawns from White's perspective (+100 = White +1.0)
  displayScore: string;
  mate: number | null;
  bestMove: string | null;
  bestMoveSan: string | null;
  depth: number;
  principalVariation: string[];
  candidateMoves: Array<{
    san: string;
    from: Square;
    to: Square;
    score: number;
    explanation: string;
  }>;
  tacticsSummary: string;
  kingSafety: {
    white: 'Secure' | 'Exposed' | 'Critical';
    black: 'Secure' | 'Exposed' | 'Critical';
  };
  materialBalance: {
    white: number;
    black: number;
    difference: number;
  };
}

export type DecisionStep =
  | 'READ'
  | 'PREDICT'
  | 'GENERATE'
  | 'CALCULATE'
  | 'EVALUATE'
  | 'CHOOSE'
  | 'REFLECT';

export interface DecisionStepData {
  step: DecisionStep;
  title: string;
  subtitle: string;
  instruction: string;
  question: string;
  options?: string[];
}

export interface GrandmasterGame {
  id: string;
  white: string;
  black: string;
  event: string;
  year: number;
  result: '1-0' | '0-1' | '1/2-1/2';
  eco: string;
  openingName: string;
  initialFen?: string;
  pgn: string;
  criticalPositionFen: string;
  criticalMoveNumber: number;
  criticalQuestion: string;
  historicalContinuation: string;
  historicalContinuationSan: string;
  historicalExplanation: string;
  alternativeOptions: Array<{
    san: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface OpeningVariation {
  id: string;
  name: string;
  eco: string;
  moves: string[]; // e.g. ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"]
  fen: string;
  category: 'e4' | 'd4' | 'Flank';
  pawnStructure: string;
  coreIdeas: string[];
  pawnBreaks: string[];
  typicalPiecePlacement: string[];
  commonMistakes: string[];
  middlegameTransition: string;
  modelGame: {
    white: string;
    black: string;
    event: string;
    year: number;
    result: string;
  };
}

export interface TrainingChallenge {
  id: string;
  title: string;
  type:
    | 'best-move'
    | 'predict-threat'
    | 'defend'
    | 'convert'
    | 'calculate-variation'
    | 'worst-piece'
    | 'endgame';
  difficulty: 'Foundation' | 'Intermediate' | 'Master';
  fen: string;
  turn: 'w' | 'b';
  objective: string;
  context: string;
  skillTrained: string;
  solutionMoves: string[]; // sequence of SAN moves
  hints: string[];
  lessonLearned: string;
}

export interface CognitiveSkills {
  tacticalRecognition: number; // 0 - 100
  calculationAccuracy: number;
  threatAwareness: number;
  candidateMoveQuality: number;
  positionalPlanning: number;
  openingUnderstanding: number;
  endgameTechnique: number;
  timeManagement: number;
  evaluationConsistency: number;
  independentArticulation: number;
}

export interface SavedGame {
  id: string;
  date: string;
  opponent: string;
  result: 'Won' | 'Lost' | 'Drawn' | 'In Progress';
  movesCount: number;
  timeControl: string;
  pgn: string;
  notes?: string;
  blundersCount: number;
  accuracy: number;
}
