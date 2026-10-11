import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessBoard } from '../ChessBoard/ChessBoard';
import { TrainingChallenge, CognitiveSkills } from '../../types/chess';
import { TRAINING_CHALLENGES } from '../../data/challenges';
import { soundManager } from '../../lib/audio';
import {
  Brain,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Target,
  Clock,
  Layers,
} from 'lucide-react';

interface ThinkingLabProps {
  onOpenDecisionLoop: () => void;
  onUpdateSkills: (updater: (prev: CognitiveSkills) => CognitiveSkills) => void;
}

export const ThinkingLab: React.FC<ThinkingLabProps> = ({
  onOpenDecisionLoop,
  onUpdateSkills,
}) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(TRAINING_CHALLENGES[0].id);
  const [filterType, setFilterType] = useState<string>('all');
  const [showHintIndex, setShowHintIndex] = useState<number>(-1);
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [feedbackText, setFeedbackText] = useState<string>('');

  const activeChallenge =
    TRAINING_CHALLENGES.find((c) => c.id === selectedChallengeId) || TRAINING_CHALLENGES[0];

  // Board for active challenge
  const [challengeChess, setChallengeChess] = useState<Chess>(() => {
    const c = new Chess();
    c.load(activeChallenge.fen);
    return c;
  });

  const [solutionStep, setSolutionStep] = useState<number>(0);

  const handleSelectChallenge = (ch: TrainingChallenge) => {
    setSelectedChallengeId(ch.id);
    const c = new Chess();
    c.load(ch.fen);
    setChallengeChess(c);
    setSolutionStep(0);
    setStatus('idle');
    setShowHintIndex(-1);
    setFeedbackText('');
  };

  const handleMove = (moveData: { from: Square; to: Square; promotion?: string; san: string }) => {
    const expectedSan = activeChallenge.solutionMoves[solutionStep];

    if (moveData.san === expectedSan) {
      soundManager.playSuccess();
      const nextStep = solutionStep + 1;

      if (nextStep >= activeChallenge.solutionMoves.length) {
        setStatus('success');
        setFeedbackText(`Magnificent! You found the master continuation. ${activeChallenge.lessonLearned}`);
        // Reward cognitive skill
        onUpdateSkills((prev) => ({
          ...prev,
          tacticalRecognition: Math.min(100, prev.tacticalRecognition + 3),
          calculationAccuracy: Math.min(100, prev.calculationAccuracy + 4),
        }));
      } else {
        setSolutionStep(nextStep);
        setFeedbackText(`Correct move! Now reply to the opponent's continuation.`);
        // Play automatic reply if specified
        setTimeout(() => {
          const replySan = activeChallenge.solutionMoves[nextStep];
          if (replySan) {
            try {
              challengeChess.move(replySan);
              setSolutionStep(nextStep + 1);
              soundManager.playMove();
            } catch (e) {
              console.warn(e);
            }
          }
        }, 500);
      }
    } else {
      soundManager.playError();
      setStatus('failed');
      setFeedbackText(`Move ${moveData.san} is imprecise. Pause before moving: calculate forcing candidate lines.`);
      setTimeout(() => {
        // Reset back to previous position
        const c = new Chess();
        c.load(activeChallenge.fen);
        setChallengeChess(c);
        setSolutionStep(0);
      }, 1200);
    }
  };

  const handleReset = () => {
    const c = new Chess();
    c.load(activeChallenge.fen);
    setChallengeChess(c);
    setSolutionStep(0);
    setStatus('idle');
    setFeedbackText('');
  };

  const filteredChallenges = TRAINING_CHALLENGES.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Cognitive Drill Chamber</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">The 7-Step Framework</span>
            <span aria-hidden="true">·</span>
            <span>Independent Calculation</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-zinc-100 mt-1">
            The Thinking Lab
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Build discipline in candidate-move generation, opponent-threat anticipation, and deep evaluation.
          </p>
        </div>

        <button
          onClick={onOpenDecisionLoop}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Brain className="w-4 h-4" />
          <span>Launch Decision Loop on Board</span>
        </button>
      </div>

      {/* Challenge Filters */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#14171d] border border-zinc-800 rounded-xl">
        {[
          { id: 'all', label: 'All Drills' },
          { id: 'best-move', label: 'Best Practical Move' },
          { id: 'predict-threat', label: 'Threat Anticipation' },
          { id: 'worst-piece', label: 'Piece Coordination' },
          { id: 'defend', label: 'Tenacious Defense' },
          { id: 'convert', label: 'Endgame Conversion' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterType === f.id
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 2-Column Workout Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Challenges List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block px-1">
            Curated Exercises ({filteredChallenges.length})
          </span>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredChallenges.map((ch) => {
              const isSelected = ch.id === activeChallenge.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => handleSelectChallenge(ch)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-zinc-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-[#14171d] hover:bg-[#181c24] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-100">{ch.title}</span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        ch.difficulty === 'Foundation'
                          ? 'text-emerald-400 bg-emerald-950/40'
                          : ch.difficulty === 'Intermediate'
                          ? 'text-amber-400 bg-amber-950/40'
                          : 'text-rose-400 bg-rose-950/40'
                      }`}
                    >
                      {ch.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2">{ch.objective}</p>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/80">
                    <span>Trains: {ch.skillTrained}</span>
                    <span className="font-mono">
                      {ch.turn === 'w' ? 'White to move' : 'Black to move'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Chessboard & Challenge Console */}
        <div className="lg:col-span-8 space-y-5">
          {/* Challenge Description Card */}
          <div className="bg-[#14171d] border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {activeChallenge.skillTrained}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Step {solutionStep} of {activeChallenge.solutionMoves.length}
              </span>
            </div>

            <h2 className="text-xl font-serif font-bold text-zinc-100">
              {activeChallenge.title}
            </h2>

            <p className="text-sm text-zinc-300 leading-relaxed">
              {activeChallenge.objective}
            </p>

            <p className="text-xs text-zinc-400 italic">
              Context: {activeChallenge.context}
            </p>
          </div>

          {/* Interactive Chessboard */}
          <div className="bg-[#14171d] border border-zinc-800 rounded-xl p-6 flex flex-col items-center space-y-4">
            <ChessBoard
              chess={challengeChess}
              orientation={activeChallenge.turn === 'w' ? 'white' : 'black'}
              interactive={status !== 'success'}
              onMove={handleMove}
            />

            {/* Interactive Feedback Strip */}
            {feedbackText && (
              <div
                className={`w-full max-w-[560px] p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2.5 ${
                  status === 'success'
                    ? 'bg-emerald-950/50 border border-emerald-600/60 text-emerald-200'
                    : status === 'failed'
                    ? 'bg-rose-950/50 border border-rose-600/60 text-rose-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                }`}
              >
                {status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : status === 'failed' ? (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <Sparkles className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                )}
                <span>{feedbackText}</span>
              </div>
            )}

            {/* Hint & Control Buttons */}
            <div className="w-full max-w-[560px] flex items-center justify-between pt-1">
              <button
                onClick={() =>
                  setShowHintIndex((prev) =>
                    Math.min(activeChallenge.hints.length - 1, prev + 1)
                  )
                }
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Request Grandmaster Hint</span>
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Exercise
              </button>
            </div>

            {/* Revealed Hints */}
            {showHintIndex >= 0 && (
              <div className="w-full max-w-[560px] p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-200 space-y-1">
                <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-400">
                  Hint {showHintIndex + 1}:
                </span>
                <p>{activeChallenge.hints[showHintIndex]}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
