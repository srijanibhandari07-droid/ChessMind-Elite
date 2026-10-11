import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessBoard } from '../ChessBoard/ChessBoard';
import { MentorId, GrandmasterGame } from '../../types/chess';
import { GRANDMASTER_PROFILES, VERIFIED_HISTORICAL_GAMES } from '../../data/grandmasters';
import { soundManager } from '../../lib/audio';
import {
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Mic,
  ChevronRight,
} from 'lucide-react';

interface GrandmasterAcademyProps {
  activeMentor: MentorId;
  onSelectMentor: (mentor: MentorId) => void;
  onOpenVoice: () => void;
}

export const GrandmasterAcademy: React.FC<GrandmasterAcademyProps> = ({
  activeMentor,
  onSelectMentor,
  onOpenVoice,
}) => {
  const mentor = GRANDMASTER_PROFILES[activeMentor] || GRANDMASTER_PROFILES.magnus;
  const games = VERIFIED_HISTORICAL_GAMES[activeMentor] || VERIFIED_HISTORICAL_GAMES.magnus;
  const [selectedGameIndex, setSelectedGameIndex] = useState<number>(0);
  const activeGame = games[selectedGameIndex] || games[0];

  // Interactive study board initialized to critical position
  const [studyChess, setStudyChess] = useState<Chess>(() => {
    const c = new Chess();
    if (activeGame?.criticalPositionFen) {
      c.load(activeGame.criticalPositionFen);
    }
    return c;
  });

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);

  // Switch game
  const handleSelectGame = (idx: number) => {
    setSelectedGameIndex(idx);
    const g = games[idx];
    if (g) {
      const c = new Chess();
      c.load(g.criticalPositionFen);
      setStudyChess(c);
      setSelectedOption(null);
      setQuizFeedback(null);
    }
  };

  // Switch mentor
  const handleSwitchMentor = (id: MentorId) => {
    onSelectMentor(id);
    setSelectedGameIndex(0);
    const newGames = VERIFIED_HISTORICAL_GAMES[id] || VERIFIED_HISTORICAL_GAMES.magnus;
    const g = newGames[0];
    if (g) {
      const c = new Chess();
      c.load(g.criticalPositionFen);
      setStudyChess(c);
      setSelectedOption(null);
      setQuizFeedback(null);
    }
  };

  const handleTestOption = (opt: { san: string; isCorrect: boolean; explanation: string }) => {
    setSelectedOption(opt.san);
    setQuizFeedback({
      correct: opt.isCorrect,
      explanation: opt.explanation,
    });

    if (opt.isCorrect) {
      soundManager.playSuccess();
      try {
        const c = new Chess();
        c.load(activeGame.criticalPositionFen);
        c.move(opt.san);
        setStudyChess(c);
      } catch (e) {
        console.warn('Move replay err:', e);
      }
    } else {
      soundManager.playError();
    }
  };

  const handleResetPosition = () => {
    const c = new Chess();
    c.load(activeGame.criticalPositionFen);
    setStudyChess(c);
    setSelectedOption(null);
    setQuizFeedback(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Academy Top Header */}
      <div className="border-b border-zinc-800 pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Historical Master Archives</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">9 Legendary Curricula</span>
            <span aria-hidden="true">·</span>
            <span>Verified PGN Notations</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-zinc-100 mt-1">
            Grandmaster Academy
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Deep dive into the tactical and strategic DNA of the greatest chess minds in history.
          </p>
        </div>

        <button
          onClick={onOpenVoice}
          className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Mic className="w-4 h-4 text-emerald-400" />
          <span>Study with {mentor.name.split(' ')[0]} Voice</span>
        </button>
      </div>

      {/* Mentor Selector Horizontal Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        {(
          [
            'magnus',
            'kasparov',
            'anand',
            'polgar',
            'nakamura',
            'capablanca',
            'fischer',
            'tal',
            'karpov',
          ] as MentorId[]
        ).map((id) => {
          const profile = GRANDMASTER_PROFILES[id];
          const isSelected = activeMentor === id;
          return (
            <button
              key={id}
              onClick={() => handleSwitchMentor(id)}
              className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                  : 'bg-[#14171d] hover:bg-[#181c24] border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-serif font-bold text-xs text-zinc-200 mb-2">
                {profile.name.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-zinc-100 truncate block">
                {profile.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-zinc-500 truncate block mt-0.5">
                {id === 'polgar' ? 'Attacking' : profile.era.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grandmaster Biography & Curriculum Overview Banner */}
      <section className="bg-[#14171d] border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${mentor.colorScheme.badge}`}>
                {mentor.era}
              </span>
              <span className="text-xs text-zinc-400">{mentor.title}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100">
              {mentor.name}
            </h2>

            <p className="text-sm text-zinc-300 leading-relaxed">{mentor.bio}</p>

            <blockquote className="p-4 bg-zinc-900/60 border-l-2 border-emerald-500 rounded-r-lg text-xs italic text-zinc-300 font-serif">
              "{mentor.quote}"
            </blockquote>

            {/* Strategic Strengths and Philosophies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-zinc-900/50 border border-zinc-800/80 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-zinc-200 block">Strategic Signature</span>
                <p className="text-zinc-400">{mentor.strategicStrength}</p>
              </div>
              <div className="p-3.5 bg-zinc-900/50 border border-zinc-800/80 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-zinc-200 block">Curriculum Focus</span>
                <p className="text-zinc-400">{mentor.curriculumFocus}</p>
              </div>
            </div>
          </div>

          {/* Right Core Philosophies */}
          <div className="lg:col-span-4 bg-[#191d26] border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Core Maxims
            </h3>
            <div className="space-y-2.5 text-xs text-zinc-300">
              {mentor.philosophies.map((phil, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono font-bold">0{i + 1}.</span>
                  <p className="leading-relaxed">{phil}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Historical Games Replay & Guess-The-Move Interactive Study */}
      {activeGame && (
        <section className="bg-[#14171d] border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                ECO {activeGame.eco} · {activeGame.year}
              </span>
              <h3 className="text-xl font-serif font-bold text-zinc-100">
                {activeGame.white} vs. {activeGame.black}
              </h3>
              <p className="text-xs text-zinc-400">{activeGame.event}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetPosition}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Critical Moment
              </button>
            </div>
          </div>

          {/* 2-Column Study Layout: Board & Quiz */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Board */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <ChessBoard
                chess={studyChess}
                interactive={false}
              />
              <span className="text-[11px] text-zinc-500 mt-2">
                Move {activeGame.criticalMoveNumber} · Side to move:{' '}
                <strong className="text-zinc-300">
                  {studyChess.turn() === 'w' ? 'White' : 'Black'}
                </strong>
              </span>
            </div>

            {/* Quiz & Comparison Deck */}
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-[#191d26] border border-zinc-800 rounded-xl p-5 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" /> The Grandmaster Moment
                </span>
                <p className="text-sm font-medium text-zinc-100 leading-relaxed">
                  {activeGame.criticalQuestion}
                </p>
              </div>

              {/* Multiple Choice Options: Guess the GM Move */}
              <div className="space-y-2.5">
                <label className="text-xs font-medium text-zinc-400 block">
                  Select your continuation:
                </label>
                {activeGame.alternativeOptions.map((opt, optIdx) => {
                  const isSelected = selectedOption === opt.san;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleTestOption(opt)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                        isSelected
                          ? opt.isCorrect
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                            : 'bg-rose-950/40 border-rose-500 text-rose-200'
                          : 'bg-zinc-900/60 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-zinc-100'
                      }`}
                    >
                      <div>
                        <span className="font-mono text-sm font-bold block">{opt.san}</span>
                        {isSelected && (
                          <span className="text-xs mt-1 block opacity-90">{opt.explanation}</span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="mt-0.5">
                          {opt.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Revealed Historical Explanation */}
              {quizFeedback && (
                <div className="p-4 bg-zinc-900 border border-zinc-700/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200 uppercase tracking-wider">
                      Historical Continuation:
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {activeGame.historicalContinuationSan}
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {activeGame.historicalExplanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
