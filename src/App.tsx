import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ScreenId, MentorId, CoachingIntensity, CognitiveSkills, SavedGame, EngineEvaluationResult } from './types/chess';
import { evaluatePosition } from './lib/engine';
import { Navbar } from './components/Navbar/Navbar';
import { EliteHome } from './components/Home/EliteHome';
import { LivePlayStudio } from './components/Play/LivePlayStudio';
import { GrandmasterAcademy } from './components/Academy/GrandmasterAcademy';
import { OpeningIntelligenceLab } from './components/Openings/OpeningIntelligenceLab';
import { ThinkingLab } from './components/ThinkingLab/ThinkingLab';
import { VoiceMentorRoom } from './components/VoiceMentor/VoiceMentorRoom';
import { DecisionLoopModal } from './components/DecisionLoop/DecisionLoopModal';
import { ProgressAndReview } from './components/Progress/ProgressAndReview';
import { GRANDMASTER_PROFILES } from './data/grandmasters';
import { soundManager } from './lib/audio';
import { Volume2, Mic, Brain } from 'lucide-react';

const INITIAL_SKILLS: CognitiveSkills = {
  tacticalRecognition: 74,
  calculationAccuracy: 68,
  threatAwareness: 62,
  candidateMoveQuality: 71,
  positionalPlanning: 76,
  openingUnderstanding: 80,
  endgameTechnique: 69,
  timeManagement: 73,
  evaluationConsistency: 70,
  independentArticulation: 65,
};

const INITIAL_SAVED_GAMES: SavedGame[] = [
  {
    id: 'game-01',
    date: 'Yesterday',
    opponent: 'Stockfish Bot (1800 Elo)',
    result: 'Won',
    movesCount: 38,
    timeControl: '10+0',
    pgn: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. Qd2 Nbd7 9. f3 b5 10. O-O-O Be7 11. g4 O-O 12. g5 Nh5 13. Nd5 Bxd5 14. exd5 f5 15. gxf6 Bxf6 16. Kb1 Nf4 17. Na5 Nb6 18. c4 bxc4 19. Nxc4 Nxc4 20. Bxc4 Qd7 21. Rc1 Kh8 22. Bb3 Rfc8 23. Rxc8+ Rxc8 24. Rc1 Rxc1+ 25. Qxc1 Nd3 26. Qc6 Qd8 27. a3 h6 28. Bc2 Nf4 29. Qxa6 Nxd5 30. Qd3 e4 31. Qxd5 exf3 32. Qf5 Kg8 33. Bb3+ Kh8 34. Bc2 Kg8 35. Qxf3 d5 36. Bb3 Kh8 37. Qxd5 Qb8 38. Ka2 1-0',
    accuracy: 88,
    blundersCount: 1,
  },
  {
    id: 'game-02',
    date: '3 days ago',
    opponent: 'Stockfish Bot (2000 Elo)',
    result: 'Drawn',
    movesCount: 47,
    timeControl: '15+10',
    pgn: '1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18. Rfd1 Rb8 19. b3 a5 20. Nd4 Rb6 21. Nxe6 fxe6 22. e4 d4 23. Bc4 Kh8 24. f4 e5 25. f5 Nf6 26. Bd3 Rc7 27. Qxa5 Ra7 28. Qd2 Ng4 29. Rc2 Ne3 30. Rdc1 Nxc2 31. Rxc2 Kh7 32. Bc4 g6 33. Qf2 gxf5 34. Qxf5+ Rg6 35. Rf2 Qg5 36. Qf8 Rag7 37. g3 Qe3 38. Qf5 Qe1+ 39. Kg2 Qe3 40. Qxe5 Rg5 41. Qf4 Qxf4 42. Rxf4 Re5 43. Kf3 Kg6 44. Ke2 Rge7 45. Kd3 Kg5 46. a4 h5 47. a5 1/2-1/2',
    accuracy: 83,
    blundersCount: 2,
  },
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [activeMentor, setActiveMentor] = useState<MentorId>('magnus');
  const [coachingIntensity, setCoachingIntensity] = useState<CoachingIntensity>('balanced');
  const [isVoiceRoomOpen, setIsVoiceRoomOpen] = useState<boolean>(false);
  const [isDecisionLoopOpen, setIsDecisionLoopOpen] = useState<boolean>(false);

  // Persistent cognitive skills & games in localStorage
  const [cognitiveSkills, setCognitiveSkills] = useState<CognitiveSkills>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chessmind_skills');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn(e);
        }
      }
    }
    return INITIAL_SKILLS;
  });

  const [savedGames, setSavedGames] = useState<SavedGame[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chessmind_games');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn(e);
        }
      }
    }
    return INITIAL_SAVED_GAMES;
  });

  const [streakCount, setStreakCount] = useState<number>(7);

  // Studio Chess instance
  const [studioChess, setStudioChess] = useState<Chess>(() => new Chess());
  const [engineEvaluation, setEngineEvaluation] = useState<EngineEvaluationResult | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('chessmind_skills', JSON.stringify(cognitiveSkills));
  }, [cognitiveSkills]);

  useEffect(() => {
    localStorage.setItem('chessmind_games', JSON.stringify(savedGames));
  }, [savedGames]);

  // Evaluate position on board change
  const triggerBoardEvaluation = () => {
    const evalResult = evaluatePosition(studioChess, 3);
    setEngineEvaluation(evalResult);
  };

  useEffect(() => {
    triggerBoardEvaluation();
  }, [studioChess.fen()]);

  const mentorProfile = GRANDMASTER_PROFILES[activeMentor] || GRANDMASTER_PROFILES.magnus;

  return (
    <div className="min-h-screen bg-[#0d0f13] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation Bar with strict Top Bar Contract */}
      <Navbar
        activeScreen={activeScreen}
        onNavigate={(screen) => setActiveScreen(screen)}
        isVoiceActive={isVoiceRoomOpen}
        onOpenVoice={() => setIsVoiceRoomOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeScreen === 'home' && (
          <EliteHome
            onNavigate={(screen) => setActiveScreen(screen)}
            onOpenVoice={() => setIsVoiceRoomOpen(true)}
            cognitiveSkills={cognitiveSkills}
            activeMentor={activeMentor}
            onSelectMentor={(m) => setActiveMentor(m)}
            hasActiveGame={studioChess.history().length > 0}
            onContinueGame={() => setActiveScreen('play')}
            streakCount={streakCount}
          />
        )}

        {activeScreen === 'play' && (
          <LivePlayStudio
            chess={studioChess}
            onBoardUpdate={() => {
              // Trigger state refresh for evaluation
              setStudioChess(new Chess(studioChess.fen()));
            }}
            engineEvaluation={engineEvaluation}
            activeMentor={activeMentor}
            onOpenVoice={() => setIsVoiceRoomOpen(true)}
            onOpenDecisionLoop={() => setIsDecisionLoopOpen(true)}
            coachingIntensity={coachingIntensity}
          />
        )}

        {activeScreen === 'academy' && (
          <GrandmasterAcademy
            activeMentor={activeMentor}
            onSelectMentor={(m) => setActiveMentor(m)}
            onOpenVoice={() => setIsVoiceRoomOpen(true)}
          />
        )}

        {activeScreen === 'openings' && (
          <OpeningIntelligenceLab
            onOpenVoice={() => setIsVoiceRoomOpen(true)}
          />
        )}

        {activeScreen === 'thinking' && (
          <ThinkingLab
            onOpenDecisionLoop={() => setIsDecisionLoopOpen(true)}
            onUpdateSkills={setCognitiveSkills}
          />
        )}

        {activeScreen === 'review' && (
          <ProgressAndReview
            cognitiveSkills={cognitiveSkills}
            savedGames={savedGames}
            streakCount={streakCount}
            onNavigateToDrill={() => setActiveScreen('thinking')}
          />
        )}
      </main>

      {/* Real-time Voice Mentor Drawer */}
      <VoiceMentorRoom
        chess={studioChess}
        engineEvaluation={engineEvaluation}
        moveHistory={studioChess.history()}
        activeMentor={activeMentor}
        onSelectMentor={(m) => setActiveMentor(m)}
        intensity={coachingIntensity}
        onChangeIntensity={(i) => setCoachingIntensity(i)}
        isOpen={isVoiceRoomOpen}
        onClose={() => setIsVoiceRoomOpen(false)}
      />

      {/* Grandmaster Decision Loop Modal */}
      <DecisionLoopModal
        chess={studioChess}
        engineEvaluation={engineEvaluation}
        isOpen={isDecisionLoopOpen}
        onClose={() => setIsDecisionLoopOpen(false)}
        onApplyMove={(san) => {
          try {
            studioChess.move(san);
            setStudioChess(new Chess(studioChess.fen()));
            soundManager.playMove();
          } catch (e) {
            console.warn(e);
          }
        }}
      />
    </div>
  );
}
