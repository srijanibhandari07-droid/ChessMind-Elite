import React from 'react';
import { ScreenId, MentorId, CognitiveSkills } from '../../types/chess';
import { GRANDMASTER_PROFILES } from '../../data/grandmasters';
import { TRAINING_CHALLENGES } from '../../data/challenges';
import {
  Play,
  Brain,
  BookOpen,
  Mic,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  Target,
  Sparkles,
} from 'lucide-react';

interface EliteHomeProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenVoice: () => void;
  cognitiveSkills: CognitiveSkills;
  activeMentor: MentorId;
  onSelectMentor: (mentor: MentorId) => void;
  hasActiveGame: boolean;
  onContinueGame: () => void;
  streakCount: number;
}

export const EliteHome: React.FC<EliteHomeProps> = ({
  onNavigate,
  onOpenVoice,
  cognitiveSkills,
  activeMentor,
  onSelectMentor,
  hasActiveGame,
  onContinueGame,
  streakCount,
}) => {
  const currentMentor = GRANDMASTER_PROFILES[activeMentor] || GRANDMASTER_PROFILES.magnus;
  const todaysChallenge = TRAINING_CHALLENGES[0];

  return (
    <div className="space-y-10 pb-16">
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#12141a]">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Text Zone */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <span>ChessMind Elite Protocol</span>
                <span aria-hidden="true">·</span>
                <span>Grandmaster Cognition Engine</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{streakCount} Day Streak</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-zinc-100 leading-[1.15] text-balance">
                Master the Art of Independent Chess Calculation.
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed">
                Engine arrows make you feel competent during analysis; rigorous decision frameworks make you formidable over the board. Train candidate moves, threat anticipation, and prophylactic judgment under voice mentorship.
              </p>
            </div>

            {/* Quick Action Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('play')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{hasActiveGame ? 'Continue Current Game' : 'Enter Live Studio'}</span>
              </button>

              <button
                onClick={onOpenVoice}
                className="px-4 py-2.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/80 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Launch Voice Coach</span>
              </button>

              <button
                onClick={() => onNavigate('thinking')}
                className="px-4 py-2.5 bg-transparent hover:bg-zinc-800/60 text-zinc-300 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>The 7-Step Loop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Hero Image Zone */}
          <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full">
            <img
              src="/src/assets/images/chessmind_hero_grandmaster_1791736863149.jpg"
              alt="Handcrafted luxury Staunton chess pieces on a wooden board"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#12141a] via-transparent to-transparent opacity-90 lg:opacity-60" />

            {/* Subtle floating quote banner */}
            <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[#0f1115]/85 backdrop-blur-md border border-zinc-700/60 text-xs text-zinc-300">
              <p className="italic font-serif">"{currentMentor.quote}"</p>
              <p className="text-[11px] font-sans text-emerald-400 mt-1 font-semibold">
                — {currentMentor.name} Mode Active
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Column Core Dashboard: Daily Plan, GM Challenge, Cognitive Profile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Today's Training Plan */}
        <div className="bg-[#14171d] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider text-emerald-400">Curriculum</span>
              <span>18 mins remaining</span>
            </div>
            <h3 className="text-lg font-serif font-bold text-zinc-100">
              Daily Cognitive Training
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Targeting candidate move generation in sharp French & Sicilian structures.
            </p>

            <div className="space-y-2 pt-2">
              <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs flex items-center justify-between">
                <span className="text-zinc-200">1. Threat Prediction Drill</span>
                <span className="text-emerald-400 font-semibold font-mono">Done</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs flex items-center justify-between">
                <span className="text-zinc-200">2. Candidate Move Generation</span>
                <span className="text-amber-400 font-semibold font-mono">In Progress</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs flex items-center justify-between">
                <span className="text-zinc-200">3. Endgames with Capablanca</span>
                <span className="text-zinc-500 font-semibold font-mono">Next</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('thinking')}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Continue Daily Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Today's Grandmaster Challenge */}
        <div className="bg-[#14171d] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider text-amber-400">Grandmaster Challenge</span>
              <span className="font-mono tabular-nums">+25 Mastery</span>
            </div>
            <h3 className="text-lg font-serif font-bold text-zinc-100">
              {todaysChallenge.title}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {todaysChallenge.objective}
            </p>

            <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Skill Trained:</span>
                <strong className="text-zinc-200 font-medium">{todaysChallenge.skillTrained}</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Level:</span>
                <strong className="text-amber-400 font-medium">{todaysChallenge.difficulty}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('thinking')}
            className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Solve Challenge</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Identified Weakness & Next Objective */}
        <div className="bg-[#14171d] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider text-rose-400">Cognitive Focus</span>
              <span>Diagnostics</span>
            </div>
            <h3 className="text-lg font-serif font-bold text-zinc-100">
              Premature Attacking Impulse
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You frequently launch kingside tactical thrusts without checking opponent counter-threats on the d-file.
            </p>

            <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Threat Awareness:</span>
                <span className="font-mono tabular-nums text-zinc-200 font-semibold">{cognitiveSkills.threatAwareness}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${cognitiveSkills.threatAwareness}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-400 pt-1">
                Objective: Complete 3 prophylactic studies under Karpov Mode.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onSelectMentor('karpov');
              onNavigate('academy');
            }}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Study Karpov Prophylaxis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Feature Showcase Grid (Academy, Openings, Thinking Lab) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-zinc-100">Training Chambers</h2>
            <p className="text-xs text-zinc-400">Select an specialized arena to sharpen your game</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Academy Card */}
          <div
            onClick={() => onNavigate('academy')}
            className="group cursor-pointer bg-[#14171d] hover:bg-[#181c24] border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all shadow-md flex flex-col"
          >
            <div className="h-44 relative overflow-hidden">
              <img
                src="/src/assets/images/grandmaster_academy_hall_1791736875666.jpg"
                alt="Grandmaster study salon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14171d] via-transparent to-transparent opacity-80" />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-serif font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  Grandmaster Academy
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  9 verified master curricula from Carlsen to Tal. Replay historical masterpieces and compare your moves against grandmaster annotations.
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 pt-2">
                Explore 9 Mentors <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Openings Card */}
          <div
            onClick={() => onNavigate('openings')}
            className="group cursor-pointer bg-[#14171d] hover:bg-[#181c24] border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all shadow-md flex flex-col"
          >
            <div className="h-44 relative overflow-hidden bg-zinc-900 flex items-center justify-center p-6">
              <div className="w-full h-full border border-zinc-700/60 rounded-lg p-3 bg-zinc-950/40 flex flex-col justify-between">
                <span className="text-[11px] font-mono text-emerald-400">ECO B90 · Sicilian Najdorf</span>
                <div className="space-y-1">
                  <div className="h-1 bg-zinc-800 rounded-full w-3/4" />
                  <div className="h-1 bg-zinc-800 rounded-full w-1/2" />
                </div>
                <span className="text-[11px] text-zinc-400">Pawn Structure & Strategic Ideas</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-serif font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  Opening Intelligence Lab
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Learn openings as complete systems of thought, not memorized move sequences. Master pawn breaks and middlegame transition plans.
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 pt-2">
                Open Opening Lab <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Thinking Lab Card */}
          <div
            onClick={() => onNavigate('thinking')}
            className="group cursor-pointer bg-[#14171d] hover:bg-[#181c24] border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all shadow-md flex flex-col"
          >
            <div className="h-44 relative overflow-hidden">
              <img
                src="/src/assets/images/thinking_lab_tactics_1791736887474.jpg"
                alt="Tactical chess knight on chessboard"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14171d] via-transparent to-transparent opacity-80" />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-serif font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  The Thinking Lab
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Put yourself through the 7-step Grandmaster Decision Loop: Read, Predict, Generate, Calculate, Evaluate, Choose, and Reflect.
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 pt-2">
                Initiate Loop Training <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
