import React, { useState } from 'react';
import { CognitiveSkills, SavedGame } from '../../types/chess';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Brain,
  Layers,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface ProgressAndReviewProps {
  cognitiveSkills: CognitiveSkills;
  savedGames: SavedGame[];
  streakCount: number;
  onNavigateToDrill: () => void;
}

export const ProgressAndReview: React.FC<ProgressAndReviewProps> = ({
  cognitiveSkills,
  savedGames,
  streakCount,
  onNavigateToDrill,
}) => {
  const [selectedGame, setSelectedGame] = useState<SavedGame | null>(savedGames[0] || null);

  const skillsList: Array<{ key: keyof CognitiveSkills; label: string; desc: string }> = [
    {
      key: 'tacticalRecognition',
      label: 'Tactical Recognition',
      desc: 'Speed in spotting pins, forks, skewers, and undefended pieces.',
    },
    {
      key: 'calculationAccuracy',
      label: 'Calculation Accuracy',
      desc: 'Precision across 3+ ply forcing candidate variations.',
    },
    {
      key: 'threatAwareness',
      label: 'Opponent-Threat Awareness',
      desc: 'Habit of asking what the opponent intends before moving.',
    },
    {
      key: 'candidateMoveQuality',
      label: 'Candidate-Move Quality',
      desc: 'Breadth and strategic relevance of initial brainstormed options.',
    },
    {
      key: 'positionalPlanning',
      label: 'Positional Planning',
      desc: 'Long-term piece outposts, open file control, and pawn play.',
    },
    {
      key: 'openingUnderstanding',
      label: 'Opening Understanding',
      desc: 'Comprehending structural ideas instead of rote memorization.',
    },
    {
      key: 'endgameTechnique',
      label: 'Endgame Technique',
      desc: 'King activity, opposition, and technical pawn conversions.',
    },
    {
      key: 'timeManagement',
      label: 'Time Management',
      desc: 'Allocating seconds proportionally to position complexity.',
    },
    {
      key: 'evaluationConsistency',
      label: 'Evaluation Consistency',
      desc: 'Accurately gauging dynamic balance versus static advantage.',
    },
    {
      key: 'independentArticulation',
      label: 'Independent Articulation',
      desc: 'Ability to explain rationale clearly without engine arrows.',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Cognitive Analytics & Review</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">10 Measurable Dimensions</span>
            <span aria-hidden="true">·</span>
            <span>Spaced Repetition</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-zinc-100 mt-1">
            Progress & Game Review
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Measure concrete chess faculties without vanity metrics or punitive streak pressures.
          </p>
        </div>

        {/* Learning Streak Banner */}
        <div className="px-4 py-2 bg-[#14171d] border border-zinc-800 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-100 block">
              {streakCount}-Day Practice Rhythm
            </span>
            <span className="text-[11px] text-zinc-400">Weekly Goal: 4 of 5 sessions</span>
          </div>
        </div>
      </div>

      {/* 10-Dimension Cognitive Skills Radar / Progress Matrix */}
      <section className="bg-[#14171d] border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-zinc-100">
              Cognitive Skill Dimensions
            </h2>
            <p className="text-xs text-zinc-400">
              Observable behavioral indicators derived from answers, challenge attempts, and game decisions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillsList.map(({ key, label, desc }) => {
            const score = cognitiveSkills[key];
            return (
              <div
                key={key}
                className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{label}</span>
                  <span className="font-mono tabular-nums font-bold text-emerald-400">
                    {score}%
                  </span>
                </div>

                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>

                <p className="text-[11px] text-zinc-400 leading-normal">{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2-Column: Recurring Mistake Patterns & Spaced Repetition Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recurring Mistake Patterns */}
        <div className="lg:col-span-6 bg-[#14171d] border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-base font-serif font-bold text-zinc-100">
              Recurring Mistake Patterns
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Algorithmic diagnostics derived from recent game history and exercise failures:
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 bg-zinc-900/60 border border-rose-950/60 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-rose-300 block">
                1. Neglecting Back-Rank Defensive Resources
              </span>
              <p className="text-zinc-400 leading-relaxed">
                In 3 recent rapid games, attacking maneuvers commenced before creating "Luft" (escape square) on h2/h7, enabling unexpected opponent back-rank swindles.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-900/60 border border-amber-950/60 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-amber-300 block">
                2. Premature Liquidation in King & Pawn Endgames
              </span>
              <p className="text-zinc-400 leading-relaxed">
                Trading minor pieces without calculating king opposition led to giving up winning advantages in two rook and pawn transitions.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToDrill}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Target Defensive Drills in Thinking Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Spaced Repetition Queue */}
        <div className="lg:col-span-6 bg-[#14171d] border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-serif font-bold text-zinc-100">
              Spaced Repetition Review Queue
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Previously missed critical positions scheduled for review to guarantee long-term neural recall:
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-200 block">
                  Karpov Prophylaxis · King's Indian Bind
                </span>
                <span className="text-[11px] text-zinc-400">Scheduled for today · Missed 3 days ago</span>
              </div>
              <button
                onClick={onNavigateToDrill}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
              >
                Review
              </button>
            </div>

            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-200 block">
                  Najdorf Poisoned Pawn Sac
                </span>
                <span className="text-[11px] text-zinc-400">Scheduled in 2 days · Retest #2</span>
              </div>
              <span className="text-xs font-mono text-zinc-500">Queued</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Review Archives */}
      <section className="bg-[#14171d] border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-zinc-100">Game Archives</h3>
            <p className="text-xs text-zinc-400">Review played games, blunders, and calculated accuracy</p>
          </div>
        </div>

        <div className="space-y-2">
          {savedGames.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-wrap items-center justify-between gap-4 ${
                selectedGame?.id === game.id
                  ? 'bg-zinc-800/90 border-emerald-500'
                  : 'bg-zinc-900/60 hover:bg-zinc-800/60 border-zinc-800 text-zinc-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      game.result === 'Won'
                        ? 'text-emerald-400 bg-emerald-950/40'
                        : game.result === 'Lost'
                        ? 'text-rose-400 bg-rose-950/40'
                        : 'text-amber-400 bg-amber-950/40'
                    }`}
                  >
                    {game.result}
                  </span>
                  <span className="text-sm font-semibold text-zinc-100">vs. {game.opponent}</span>
                  <span className="text-xs text-zinc-500">{game.date}</span>
                </div>
                <p className="text-xs text-zinc-400 font-mono truncate max-w-md">
                  {game.pgn}
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs text-zinc-400">
                <div className="text-right">
                  <span className="block text-zinc-500 text-[10px]">ACCURACY</span>
                  <span className="font-mono font-bold text-zinc-100 tabular-nums">
                    {game.accuracy}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-zinc-500 text-[10px]">MOVES</span>
                  <span className="font-mono text-zinc-100 tabular-nums">{game.movesCount}</span>
                </div>
                <div className="text-right">
                  <span className="block text-zinc-500 text-[10px]">BLUNDERS</span>
                  <span className="font-mono text-emerald-400 tabular-nums">{game.blundersCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
