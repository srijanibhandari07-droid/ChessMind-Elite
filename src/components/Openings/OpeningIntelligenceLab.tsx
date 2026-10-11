import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessBoard } from '../ChessBoard/ChessBoard';
import { OpeningVariation } from '../../types/chess';
import { OPENINGS_DATABASE } from '../../data/openings';
import { soundManager } from '../../lib/audio';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Layers,
  Shield,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface OpeningIntelligenceLabProps {
  onOpenVoice: () => void;
}

export const OpeningIntelligenceLab: React.FC<OpeningIntelligenceLabProps> = ({
  onOpenVoice,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'e4' | 'd4'>('all');
  const [selectedOpeningId, setSelectedOpeningId] = useState<string>(OPENINGS_DATABASE[0].id);
  const [savedRepertoire, setSavedRepertoire] = useState<string[]>(['sicilian-najdorf']);

  const activeOpening =
    OPENINGS_DATABASE.find((op) => op.id === selectedOpeningId) || OPENINGS_DATABASE[0];

  // Interactive board initialized to opening line
  const [openingChess, setOpeningChess] = useState<Chess>(() => {
    const c = new Chess();
    if (activeOpening?.fen) c.load(activeOpening.fen);
    return c;
  });

  const [currentMoveStep, setCurrentMoveStep] = useState<number>(activeOpening.moves.length);

  const handleSelectOpening = (op: OpeningVariation) => {
    setSelectedOpeningId(op.id);
    const c = new Chess();
    c.load(op.fen);
    setOpeningChess(c);
    setCurrentMoveStep(op.moves.length);
  };

  const handleToggleRepertoire = (id: string) => {
    setSavedRepertoire((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetToStart = () => {
    const c = new Chess();
    setOpeningChess(c);
    setCurrentMoveStep(0);
  };

  const handleStepToMove = (stepIndex: number) => {
    const c = new Chess();
    for (let i = 0; i <= stepIndex; i++) {
      if (activeOpening.moves[i]) {
        try {
          c.move(activeOpening.moves[i]);
        } catch (e) {
          console.warn('Step move error:', e);
        }
      }
    }
    setOpeningChess(c);
    setCurrentMoveStep(stepIndex + 1);
    soundManager.playMove();
  };

  const handleLoadFullLine = () => {
    const c = new Chess();
    c.load(activeOpening.fen);
    setOpeningChess(c);
    setCurrentMoveStep(activeOpening.moves.length);
  };

  // Filter openings
  const filteredOpenings = OPENINGS_DATABASE.filter((op) => {
    const matchesSearch =
      op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.eco.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || op.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const isSaved = savedRepertoire.includes(activeOpening.id);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Opening Theory Lab</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Strategic Systems</span>
            <span aria-hidden="true">·</span>
            <span>ECO Encyclopedia</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-zinc-100 mt-1">
            Opening Intelligence Lab
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Learn openings as cohesive plans, pawn breaks, and piece placements—not mechanical memorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Repertoire Count Indicator */}
          <span className="text-xs text-zinc-400 font-mono tabular-nums bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
            {savedRepertoire.length} in Repertoire
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14171d] border border-zinc-800 rounded-xl p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search opening by name or ECO (e.g. Najdorf, Berlin, B90)..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden"
          />
        </div>

        {/* Interactive Filter Tabs (Buttons allowed per Constitution) */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
          {(['all', 'e4', 'd4'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterCategory === cat
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat === 'all' ? 'All Lines' : cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Opening Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Opening Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block px-1">
            Repertoire Variations ({filteredOpenings.length})
          </span>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredOpenings.map((op) => {
              const isSelected = op.id === activeOpening.id;
              const saved = savedRepertoire.includes(op.id);
              return (
                <div
                  key={op.id}
                  onClick={() => handleSelectOpening(op)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-zinc-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-[#14171d] hover:bg-[#181c24] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {op.eco}
                      </span>
                      <span className="text-xs font-semibold text-zinc-100">{op.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono truncate max-w-[220px]">
                      {op.moves.join(' ')}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRepertoire(op.id);
                    }}
                    title={saved ? 'Remove from Repertoire' : 'Save to Repertoire'}
                    className="p-1 text-zinc-500 hover:text-emerald-400 transition-colors"
                  >
                    {saved ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Board & Strategic Intelligence Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Opening Banner */}
          <div className="bg-[#14171d] border border-zinc-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="font-mono text-emerald-400 font-semibold">{activeOpening.eco}</span>
                <span aria-hidden="true">·</span>
                <span>{activeOpening.category.toUpperCase()} Repertoire</span>
                <span aria-hidden="true">·</span>
                <span>Model Game: {activeOpening.modelGame.white} ({activeOpening.modelGame.year})</span>
              </div>
              <h2 className="text-xl font-serif font-bold text-zinc-100 mt-1">
                {activeOpening.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleRepertoire(activeOpening.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
                  isSaved
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'In Repertoire' : 'Add to Repertoire'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Opening Board & Move Sequence */}
          <div className="bg-[#14171d] border border-zinc-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-6 flex flex-col items-center">
              <ChessBoard
                chess={openingChess}
                interactive={false}
              />
              <div className="flex items-center justify-between w-full max-w-[560px] pt-2 text-xs">
                <button
                  onClick={handleResetToStart}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                >
                  Start
                </button>
                <span className="text-zinc-500">
                  Step {currentMoveStep} / {activeOpening.moves.length}
                </span>
                <button
                  onClick={handleLoadFullLine}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                >
                  Full Tabia
                </button>
              </div>
            </div>

            {/* Move List Clickable Chips */}
            <div className="md:col-span-6 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                Theoretical Move Sequence
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeOpening.moves.map((move, idx) => {
                  const isCurrent = idx === currentMoveStep - 1;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleStepToMove(idx)}
                      className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                        isCurrent
                          ? 'bg-emerald-600 text-white font-bold'
                          : idx < currentMoveStep
                          ? 'bg-zinc-800 text-zinc-200'
                          : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {idx % 2 === 0 ? `${idx / 2 + 1}.` : ''} {move}
                    </button>
                  );
                })}
              </div>

              {/* Strategic Insights Cards */}
              <div className="space-y-3 pt-3">
                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-emerald-400 block flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> Pawn Structure
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{activeOpening.pawnStructure}</p>
                </div>

                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-amber-400 block flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Typical Pawn Breaks
                  </span>
                  <div className="space-y-1 text-zinc-300">
                    {activeOpening.pawnBreaks.map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-400" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-rose-400 block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Common Pitfalls to Avoid
                  </span>
                  <div className="space-y-1 text-zinc-300">
                    {activeOpening.commonMistakes.map((m, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
