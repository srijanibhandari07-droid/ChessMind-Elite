import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessBoard } from '../ChessBoard/ChessBoard';
import { EngineEvaluationResult, MentorId, CoachingIntensity } from '../../types/chess';
import { evaluatePosition, getBotMove, calculateMaterialBalance } from '../../lib/engine';
import { soundManager } from '../../lib/audio';
import { GRANDMASTER_PROFILES } from '../../data/grandmasters';
import {
  RotateCcw,
  Flag,
  FlipHorizontal,
  Brain,
  Mic,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Bot,
  User,
  Volume2,
} from 'lucide-react';

interface LivePlayStudioProps {
  chess: Chess;
  onBoardUpdate: () => void;
  engineEvaluation: EngineEvaluationResult | null;
  activeMentor: MentorId;
  onOpenVoice: () => void;
  onOpenDecisionLoop: () => void;
  coachingIntensity: CoachingIntensity;
}

export const LivePlayStudio: React.FC<LivePlayStudioProps> = ({
  chess,
  onBoardUpdate,
  engineEvaluation,
  activeMentor,
  onOpenVoice,
  onOpenDecisionLoop,
  coachingIntensity,
}) => {
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [showEngineEval, setShowEngineEval] = useState<boolean>(false);
  const [botElo, setBotElo] = useState<number>(1800);
  const [timeControl, setTimeControl] = useState<'3+2' | '10+0' | '15+10' | 'untimed'>('10+0');
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);
  const [isClockRunning, setIsClockRunning] = useState<boolean>(false);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({
    white: [],
    black: [],
  });

  const clockIntervalRef = useRef<any>(null);
  const mentorProfile = GRANDMASTER_PROFILES[activeMentor] || GRANDMASTER_PROFILES.magnus;

  // Initialize clock based on time control
  const resetClock = (tc: string) => {
    let base = 600;
    if (tc === '3+2') base = 180;
    if (tc === '15+10') base = 900;
    if (tc === 'untimed') base = 0;
    setWhiteTime(base);
    setBlackTime(base);
    setIsClockRunning(tc !== 'untimed');
  };

  // Clock tick timer
  useEffect(() => {
    if (timeControl === 'untimed') return;

    if (isClockRunning && !chess.isGameOver()) {
      clockIntervalRef.current = setInterval(() => {
        if (chess.turn() === 'w') {
          setWhiteTime((prev) => {
            if (prev <= 1) {
              setIsClockRunning(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime((prev) => {
            if (prev <= 1) {
              setIsClockRunning(false);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    }

    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, [isClockRunning, chess.turn(), chess.fen()]);

  // Handle player move
  const handlePlayerMove = (moveData: { from: Square; to: Square; promotion?: string; san: string }) => {
    setLastMove({ from: moveData.from, to: moveData.to });
    setMoveHistory(chess.history());
    updateCapturedPieces();
    onBoardUpdate();

    if (!isClockRunning && timeControl !== 'untimed') {
      setIsClockRunning(true);
    }

    // Bot reply trigger if game is not over and it's Black's turn
    if (!chess.isGameOver() && chess.turn() === 'b') {
      setIsBotThinking(true);
      const delay = Math.min(1200, Math.max(500, Math.random() * 800 + 400));
      setTimeout(() => {
        const botMove = getBotMove(chess, botElo);
        if (botMove) {
          try {
            const res = chess.move(botMove);
            if (res) {
              if (res.captured) soundManager.playCapture();
              else soundManager.playMove();

              if (chess.inCheck()) soundManager.playCheck();

              setLastMove({ from: botMove.from, to: botMove.to });
              setMoveHistory(chess.history());
              updateCapturedPieces();
              onBoardUpdate();
            }
          } catch (err) {
            console.error('Bot move failed:', err);
          }
        }
        setIsBotThinking(false);
      }, delay);
    }
  };

  const updateCapturedPieces = () => {
    // Compare standard starting army with current board
    const currentBoard = chess.board();
    const count: Record<string, number> = {
      wP: 0, wN: 0, wB: 0, wR: 0, wQ: 0,
      bP: 0, bN: 0, bB: 0, bR: 0, bQ: 0,
    };

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = currentBoard[r][f];
        if (piece && piece.type !== 'k') {
          const key = `${piece.color}${piece.type.toUpperCase()}`;
          count[key] = (count[key] || 0) + 1;
        }
      }
    }

    const startArmy = { P: 8, N: 2, B: 2, R: 2, Q: 1 };
    const missingWhite: string[] = [];
    const missingBlack: string[] = [];

    (Object.keys(startArmy) as Array<keyof typeof startArmy>).forEach((type) => {
      const whiteDiff = startArmy[type] - (count[`w${type}`] || 0);
      for (let i = 0; i < whiteDiff; i++) missingWhite.push(`w${type}`);

      const blackDiff = startArmy[type] - (count[`b${type}`] || 0);
      for (let i = 0; i < blackDiff; i++) missingBlack.push(`b${type}`);
    });

    setCapturedPieces({
      white: missingWhite, // white pieces captured by black
      black: missingBlack, // black pieces captured by white
    });
  };

  const handleUndo = () => {
    if (chess.history().length >= 2) {
      chess.undo();
      chess.undo();
      setMoveHistory(chess.history());
      setLastMove(null);
      updateCapturedPieces();
      onBoardUpdate();
    } else if (chess.history().length === 1) {
      chess.undo();
      setMoveHistory(chess.history());
      setLastMove(null);
      updateCapturedPieces();
      onBoardUpdate();
    }
  };

  const handleResetGame = () => {
    if (window.confirm('Start a new training game?')) {
      chess.reset();
      setMoveHistory([]);
      setLastMove(null);
      setCapturedPieces({ white: [], black: [] });
      resetClock(timeControl);
      onBoardUpdate();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const material = calculateMaterialBalance(chess);

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-serif font-bold text-zinc-100 flex items-center gap-3">
            Live Play Studio
            <span className="text-xs font-sans font-normal text-zinc-400 px-2 py-0.5 rounded bg-zinc-800">
              Training Mode
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Play against adaptive bots with optional mentor guidance and engine analysis
          </p>
        </div>

        {/* Studio Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDecisionLoop}
            className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
          >
            <Brain className="w-3.5 h-3.5 text-emerald-400" />
            <span>Grandmaster Decision Loop</span>
          </button>

          <button
            onClick={onOpenVoice}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>Consult {mentorProfile.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* Main Studio 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Chessboard */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center space-y-4">
          {/* Opponent HUD Strip (Top) */}
          <div className="w-full max-w-[560px] flex items-center justify-between px-3 py-2 bg-[#16181f] border border-zinc-800 rounded-lg text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <Bot className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <span className="font-semibold text-zinc-200 block">
                  Stockfish Bot ({botElo} Elo)
                </span>
                <span className="text-[11px] text-zinc-400">
                  {isBotThinking ? 'Thinking...' : 'Waiting for move'}
                </span>
              </div>
            </div>

            {/* Opponent Clock */}
            <div
              className={`px-3 py-1 rounded font-mono text-sm font-semibold tabular-nums border ${
                chess.turn() === 'b'
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-300'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800'
              }`}
            >
              {timeControl === 'untimed' ? 'Untimed' : formatTime(blackTime)}
            </div>
          </div>

          {/* Captured Pieces by Opponent */}
          <div className="w-full max-w-[560px] flex items-center justify-between text-xs text-zinc-400 px-1">
            <div className="flex items-center gap-1 min-h-[22px]">
              {capturedPieces.white.map((p, idx) => (
                <span key={idx} className="font-mono text-xs opacity-80">
                  {p.charAt(1)}
                </span>
              ))}
            </div>
            {material.difference < 0 && (
              <span className="font-mono text-xs font-semibold text-rose-400">
                +{Math.abs(material.difference)}
              </span>
            )}
          </div>

          {/* The Chessboard */}
          <ChessBoard
            chess={chess}
            orientation={orientation}
            interactive={!isBotThinking && !chess.isGameOver()}
            onMove={handlePlayerMove}
            lastMove={lastMove}
          />

          {/* Captured Pieces by Player */}
          <div className="w-full max-w-[560px] flex items-center justify-between text-xs text-zinc-400 px-1">
            <div className="flex items-center gap-1 min-h-[22px]">
              {capturedPieces.black.map((p, idx) => (
                <span key={idx} className="font-mono text-xs opacity-80">
                  {p.charAt(1)}
                </span>
              ))}
            </div>
            {material.difference > 0 && (
              <span className="font-mono text-xs font-semibold text-emerald-400">
                +{material.difference}
              </span>
            )}
          </div>

          {/* Player HUD Strip (Bottom) */}
          <div className="w-full max-w-[560px] flex items-center justify-between px-3 py-2 bg-[#16181f] border border-zinc-800 rounded-lg text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-zinc-200 block">Learner</span>
                <span className="text-[11px] text-zinc-400">
                  {chess.turn() === 'w' ? 'Your turn to move' : 'Opponent’s turn'}
                </span>
              </div>
            </div>

            {/* Player Clock */}
            <div
              className={`px-3 py-1 rounded font-mono text-sm font-semibold tabular-nums border ${
                chess.turn() === 'w'
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-300'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800'
              }`}
            >
              {timeControl === 'untimed' ? 'Untimed' : formatTime(whiteTime)}
            </div>
          </div>

          {/* Board Interactive Controls Bar */}
          <div className="w-full max-w-[560px] flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}
                title="Flip Board"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/80"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={handleUndo}
                title="Undo Move"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/80"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowEngineEval(!showEngineEval)}
                title={showEngineEval ? 'Hide Engine Evaluation' : 'Show Engine Evaluation'}
                className={`p-2 rounded-lg transition-colors border ${
                  showEngineEval
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700/80'
                }`}
              >
                {showEngineEval ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetGame}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium border border-zinc-700"
              >
                New Game
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Resign this game?')) {
                    alert('Game resigned.');
                  }
                }}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 rounded-lg text-xs font-medium border border-zinc-800"
              >
                <Flag className="w-3.5 h-3.5 inline mr-1" /> Resign
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Move History & Analysis Deck */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Game Status Banner if in check or game over */}
          {chess.isGameOver() && (
            <div className="p-4 bg-amber-950/40 border border-amber-700/50 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-amber-300">
                {chess.isCheckmate()
                  ? `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins.`
                  : chess.isDraw()
                  ? 'Game drawn.'
                  : 'Game Over'}
              </p>
              <p className="text-zinc-300">Review your moves to identify critical turning points.</p>
            </div>
          )}

          {chess.inCheck() && !chess.isGameOver() && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>{chess.turn() === 'w' ? 'White' : 'Black'} is in check!</span>
            </div>
          )}

          {/* Engine Evaluation Panel (if enabled) */}
          {showEngineEval && engineEvaluation && (
            <div className="bg-[#16181f] border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Engine Evaluation
                </span>
                <span className="font-mono font-bold text-sm text-zinc-100">
                  {engineEvaluation.displayScore}
                </span>
              </div>

              {/* Eval Gauge Bar */}
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-zinc-200 h-full transition-all duration-300"
                  style={{
                    width: `${Math.max(5, Math.min(95, 50 + (engineEvaluation.score / 20)))}%`,
                  }}
                />
                <div className="bg-zinc-900 h-full flex-1" />
              </div>

              <div className="text-xs text-zinc-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Best continuation:</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {engineEvaluation.bestMoveSan || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tactical reading:</span>
                  <span className="text-zinc-300 text-right max-w-[180px] truncate">
                    {engineEvaluation.tacticsSummary}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Move History Table */}
          <div className="bg-[#16181f] border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
              <span className="font-semibold uppercase tracking-wider">Notation History</span>
              <span className="font-mono tabular-nums">{moveHistory.length} moves</span>
            </div>

            <div className="h-60 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
              {moveHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-500 italic">
                  Game starting. White makes the first move.
                </div>
              ) : (
                Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
                  const whiteMove = moveHistory[i * 2];
                  const blackMove = moveHistory[i * 2 + 1];
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between px-2 py-1 rounded hover:bg-zinc-800/50"
                    >
                      <span className="text-zinc-500 w-8">{i + 1}.</span>
                      <span className="text-zinc-200 flex-1 font-semibold">{whiteMove}</span>
                      <span className="text-zinc-400 flex-1">{blackMove || ''}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Match Settings & Bot Configuration */}
          <div className="bg-[#16181f] border border-zinc-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
              Opponent & Time Settings
            </span>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Bot Strength:</label>
                <select
                  value={botElo}
                  onChange={(e) => setBotElo(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-hidden"
                >
                  <option value={800}>800 Elo · Novice</option>
                  <option value={1200}>1200 Elo · Intermediate</option>
                  <option value={1600}>1600 Elo · Club Player</option>
                  <option value={2000}>2000 Elo · Expert</option>
                  <option value={2400}>2400 Elo · Grandmaster</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Time Control:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['3+2', '10+0', '15+10', 'untimed'] as const).map((tc) => (
                    <button
                      key={tc}
                      onClick={() => {
                        setTimeControl(tc);
                        resetClock(tc);
                      }}
                      className={`py-1 rounded text-[11px] font-medium transition-colors ${
                        timeControl === tc
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {tc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
