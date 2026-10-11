import React, { useState, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { soundManager } from '../../lib/audio';

interface ChessBoardProps {
  chess: Chess;
  orientation?: 'white' | 'black';
  interactive?: boolean;
  onMove?: (move: { from: Square; to: Square; promotion?: string; san: string }) => void;
  lastMove?: { from: Square; to: Square } | null;
  candidateArrows?: Array<{ from: Square; to: Square; color?: string }>;
  highlightSquares?: Square[];
}

// Staunton SVG Piece Component
export const ChessPieceSvg: React.FC<{ piece: string; className?: string }> = ({ piece, className = 'w-full h-full' }) => {
  // piece: 'wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', etc.
  const isWhite = piece.startsWith('w');
  const type = piece.charAt(1).toUpperCase();

  const fill = isWhite ? '#ffffff' : '#1e232a';
  const stroke = isWhite ? '#1e232a' : '#f1f5f9';
  const accent = isWhite ? '#e2e8f0' : '#0f1115';

  switch (type) {
    case 'P':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'N':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="m 22,10 c 10.5,1 16.5,8 16,29 L 15,39 C 15,30 9.65,24 9,20 c 8,0 11,-4 13,-10 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="m 24,18 c 0.38,2.91 -5.55,7.37 -8,9 -3,2 -2.82,4.34 -5,4 -1.04,-0.94 -1.48,-4.91 1,-7 2.26,-1.94 4.5,-4.5 5,-6 0.5,-1.5 2,-2 3,-1 1.25,1 1.5,1.5 4,1 z"
            fill={accent}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <circle cx="15.5" cy="18.5" r="1.5" fill={isWhite ? '#1e232a' : '#ffffff'} />
        </svg>
      );
    case 'B':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
            <path d="m 9,36 c 3.39,-0.97 10.11,0.43 13.5,-2 3.39,2.43 10.11,1.03 13.5,2 0,0 1.65,0.54 3,2 -0.68,0.97 -1.65,0.99 -3,1 -3.39,-0.97 -10.11,0.46 -13.5,-1 -3.39,1.46 -10.11,0.03 -13.5,1 -1.35,-0.01 -2.32,-0.03 -3,-1 1.35,-1.46 3,-2 3,-2 z" />
            <path d="m 15,32 c 2.5,2.5 12.5,2.5 15,0 0.5,-1.5 0,-2 0,-2 0,-2.5 -2.5,-4 -2.5,-4 5.5,-1.5 6,-11.5 -5,-15.5 -11,4 -10.5,14 -5,15.5 0,0 -2.5,1.5 -2.5,4 0,0 -0.5,0.5 0,2 z" />
            <circle cx="22.5" cy="8.5" r="2.5" />
          </g>
          <path d="m 17.5,18 10,0 M 22.5,13.5 22.5,22.5" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case 'R':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
            <path d="m 9,39 27,0 c 0,-3 -3,-3 -3,-3 L 12,36 c 0,0 -3,0 -3,3 z" />
            <path d="m 12,36 1.5,-17 18,0 1.5,17 -21,0 z" />
            <path d="m 11,14 1.5,5 20,0 1.5,-5 -3,0 0,2 -4,0 0,-2 -4,0 0,2 -4,0 0,-2 -7,0 z" />
          </g>
        </svg>
      );
    case 'Q':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
            <path d="m 9,26 c 8.5,-1.5 21,-1.5 27,0 l 2,-12 -7,11 -4.5,-15 -4,15 -7,-11 2.5,12 z" />
            <path d="m 9,26 c 0,2 1.5,2 2.5,4 1,1.5 1,1 0.5,3.5 -1.5,1 -1.5,2.5 -1.5,2.5 -1.5,1.5 0.5,2.5 0.5,2.5 6.5,1 16.5,1 23,0 0,0 1.5,-1 0.5,-2.5 0,0 0,-1.5 -1.5,-2.5 -0.5,-2.5 -0.5,-2 0.5,-3.5 1,-2 2.5,-2 2.5,-4 -8.5,-1.5 -18.5,-1.5 -27,0 z" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
          </g>
        </svg>
      );
    case 'K':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
            <path d="m 22.5,11.63 0,7.37 M 19,15.5 l 7,0" />
            <path d="m 22.5,25 c 0,0 4.5,-7.5 3,-10.5 -1.5,-3 -6,-3 -7.5,0 -1.5,3 3,10.5 3,10.5" fill={accent} />
            <path d="m 12.5,37 c 5.5,3.5 14.5,3.5 20,0 0,-4 -3.5,-5 -4.5,-7.5 -1,-2.5 -0.5,-3.5 -0.5,-3.5 -5,-2 -10,-2 -15,0 0,0 0.5,1 -0.5,3.5 -1,2.5 -4.5,3.5 -4.5,7.5 z" />
            <path d="m 11.5,37 c 5.5,2 16.5,2 22,0 0,0 0.5,1.5 -1,2.5 -4,2 -16,2 -20,0 -1.5,-1 -1,-2.5 -1,-2.5 z" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  orientation = 'white',
  interactive = true,
  onMove,
  lastMove,
  candidateArrows = [],
  highlightSquares = [],
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = orientation === 'white' ? files : [...files].reverse();
  const displayRanks = orientation === 'white' ? ranks : [...ranks].reverse();

  // Reset selected square when board or turn changes
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [chess.fen()]);

  const handleSquareClick = (square: Square) => {
    if (!interactive) return;

    // If waiting for promotion selection, ignore clicks
    if (pendingPromotion) return;

    const piece = chess.get(square);
    const isCurrentTurnPiece = piece && piece.color === chess.turn();

    // 1. If clicking our own piece, select it and compute legal moves
    if (isCurrentTurnPiece) {
      if (selectedSquare === square) {
        // Toggle off
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true });
        setLegalMoves(moves);
      }
      return;
    }

    // 2. If a piece was already selected, check if this is a legal move
    if (selectedSquare) {
      const matchMove = legalMoves.find((m) => m.to === square);
      if (matchMove) {
        // Check for pawn promotion
        const movingPiece = chess.get(selectedSquare);
        const isPromotion =
          movingPiece?.type === 'p' &&
          ((movingPiece.color === 'w' && square.endsWith('8')) ||
            (movingPiece.color === 'b' && square.endsWith('1')));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        executeMove(selectedSquare, square);
      } else {
        // Clicked invalid square, deselect
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const executeMove = (from: Square, to: Square, promotion: string = 'q') => {
    try {
      const moveResult = chess.move({ from, to, promotion });
      if (moveResult) {
        if (moveResult.captured) {
          soundManager.playCapture();
        } else {
          soundManager.playMove();
        }

        if (chess.inCheck()) {
          soundManager.playCheck();
        }

        setSelectedSquare(null);
        setLegalMoves([]);
        setPendingPromotion(null);

        if (onMove) {
          onMove({ from, to, promotion, san: moveResult.san });
        }
      }
    } catch (e) {
      console.warn('Illegal move attempted:', e);
      soundManager.playError();
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handlePromotionSelect = (promoType: 'q' | 'r' | 'b' | 'n') => {
    if (!pendingPromotion) return;
    executeMove(pendingPromotion.from, pendingPromotion.to, promoType);
  };

  // Find checked king square
  let checkedKingSquare: Square | null = null;
  if (chess.inCheck()) {
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (p && p.type === 'k' && p.color === chess.turn()) {
          checkedKingSquare = (String.fromCharCode(97 + f) + (8 - r)) as Square;
        }
      }
    }
  }

  return (
    <div className="relative select-none aspect-square w-full max-w-[560px] mx-auto rounded-lg overflow-hidden border border-zinc-800 shadow-2xl bg-[#16181d]">
      {/* 8x8 Chessboard Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayRanks.map((rank, rankIdx) =>
          displayFiles.map((file, fileIdx) => {
            const square = `${file}${rank}` as Square;
            const isLightSquare = (fileIdx + rankIdx) % 2 === 0;
            const piece = chess.get(square);

            const isSelected = selectedSquare === square;
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
            const isCheckSquare = checkedKingSquare === square;
            const isLegalTarget = legalMoves.some((m) => m.to === square);
            const isCaptureTarget = isLegalTarget && piece && piece.color !== chess.turn();
            const isCustomHighlight = highlightSquares.includes(square);

            // Staunton theme square colors: warm ivory and deep graphite walnut
            const squareBg = isLightSquare ? 'bg-[#ede3cf]' : 'bg-[#5b6473]';

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${squareBg} ${
                  isSelected ? 'square-highlight-selected ring-4 ring-emerald-500 z-10' : ''
                } ${isLastMove ? 'square-highlight-lastmove' : ''} ${
                  isCheckSquare ? 'square-highlight-check' : ''
                } ${isCustomHighlight ? 'bg-amber-500/40' : ''}`}
                data-square={square}
              >
                {/* Board Rank Label (Leftmost column) */}
                {fileIdx === 0 && (
                  <span
                    className={`absolute top-1 left-1.5 text-[10px] font-semibold pointer-events-none ${
                      isLightSquare ? 'text-[#7d8799]' : 'text-[#d6decb]'
                    }`}
                  >
                    {rank}
                  </span>
                )}

                {/* Board File Label (Bottom row) */}
                {rankIdx === 7 && (
                  <span
                    className={`absolute bottom-1 right-1.5 text-[10px] font-semibold pointer-events-none ${
                      isLightSquare ? 'text-[#7d8799]' : 'text-[#d6decb]'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Piece Image */}
                {piece && (
                  <div className="w-[84%] h-[84%] flex items-center justify-center transition-transform hover:scale-105 pointer-events-none z-10">
                    <ChessPieceSvg piece={`${piece.color}${piece.type.toUpperCase()}`} />
                  </div>
                )}

                {/* Legal Move Indicators */}
                {isLegalTarget && !isCaptureTarget && (
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-emerald-500/75 pointer-events-none z-20 shadow-sm" />
                )}

                {/* Capture Ring Indicator */}
                {isCaptureTarget && (
                  <div className="absolute inset-1 rounded-full border-4 border-emerald-500/80 pointer-events-none z-20" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pawn Promotion Modal Overlay */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d24] border border-zinc-700 rounded-xl p-5 shadow-2xl text-center max-w-xs w-full">
            <h4 className="text-sm font-semibold text-zinc-200 mb-3 tracking-wide uppercase">
              Promote Pawn
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {(['q', 'r', 'b', 'n'] as const).map((type) => {
                const colorPrefix = chess.turn();
                return (
                  <button
                    key={type}
                    onClick={() => handlePromotionSelect(type)}
                    className="p-3 bg-zinc-800 hover:bg-emerald-600/30 hover:border-emerald-500 border border-zinc-700 rounded-lg flex items-center justify-center transition-all group"
                  >
                    <div className="w-10 h-10 group-hover:scale-110 transition-transform">
                      <ChessPieceSvg piece={`${colorPrefix}${type.toUpperCase()}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
