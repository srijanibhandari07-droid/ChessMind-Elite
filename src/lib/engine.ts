import { Chess, Square, Move } from 'chess.js';
import { EngineEvaluationResult } from '../types/chess';

// Piece values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Simplified PeSTO-style piece-square tables for middle game (from White's perspective, rank 8 to 1)
const PAWN_TABLE = [
  0,   0,   0,   0,   0,   0,   0,   0,
  50, 50,  50,  50,  50,  50,  50,  50,
  10, 10,  20,  30,  30,  20,  10,  10,
   5,  5,  10,  25,  25,  10,   5,   5,
   0,  0,   0,  20,  20,   0,   0,   0,
   5, -5, -10,   0,   0, -10,  -5,   5,
   5, 10,  10, -20, -20,  10,  10,   5,
   0,  0,   0,   0,   0,   0,   0,   0
];

const KNIGHT_TABLE = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20,   0,   0,   0,   0, -20, -40,
  -30,   0,  10,  15,  15,  10,   0, -30,
  -30,   5,  15,  20,  20,  15,   5, -30,
  -30,   0,  15,  20,  20,  15,   0, -30,
  -30,   5,  10,  15,  15,  10,   5, -30,
  -40, -20,   0,   5,   5,   0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50
];

const BISHOP_TABLE = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,  10,  10,   5,   0, -10,
  -10,   5,   5,  10,  10,   5,   5, -10,
  -10,   0,  10,  10,  10,  10,   0, -10,
  -10,  10,  10,  10,  10,  10,  10, -10,
  -10,   5,   0,   0,   0,   0,   5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20
];

const ROOK_TABLE = [
    0,   0,   0,   0,   0,   0,   0,   0,
    5,  10,  10,  10,  10,  10,  10,   5,
   -5,   0,   0,   0,   0,   0,   0,  -5,
   -5,   0,   0,   0,   0,   0,   0,  -5,
   -5,   0,   0,   0,   0,   0,   0,  -5,
   -5,   0,   0,   0,   0,   0,   0,  -5,
   -5,   0,   0,   0,   0,   0,   0,  -5,
    0,   0,   0,   5,   5,   0,   0,   0
];

const QUEEN_TABLE = [
  -20, -10, -10,  -5,  -5, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,   5,   5,   5,   0, -10,
   -5,   0,   5,   5,   5,   5,   0,  -5,
    0,   0,   5,   5,   5,   5,   0,  -5,
  -10,   5,   5,   5,   5,   5,   0, -10,
  -10,   0,   5,   0,   0,   0,   0, -10,
  -20, -10, -10,  -5,  -5, -10, -10, -20
];

const KING_TABLE_MID = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
   20,  20,   0,   0,   0,   0,  20,  20,
   20,  30,  10,   0,   0,  10,  30,  20
];

function getSquareIndex(file: number, rank: number, isWhite: boolean): number {
  if (isWhite) {
    return (7 - rank) * 8 + file;
  } else {
    return rank * 8 + file;
  }
}

/**
 * Static position evaluation (from White's perspective)
 */
export function evaluateBoardStatic(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -30000 : 30000;
  }
  if (chess.isDraw()) {
    return 0;
  }

  const board = chess.board();
  let materialScore = 0;
  let positionalScore = 0;
  let whiteBishops = 0;
  let blackBishops = 0;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      const rankIdx = 7 - r;
      const fileIdx = f;
      const isWhite = piece.color === 'w';
      const sqIdx = getSquareIndex(fileIdx, rankIdx, isWhite);

      let psqtBonus = 0;
      switch (piece.type) {
        case 'p':
          psqtBonus = PAWN_TABLE[sqIdx];
          break;
        case 'n':
          psqtBonus = KNIGHT_TABLE[sqIdx];
          break;
        case 'b':
          psqtBonus = BISHOP_TABLE[sqIdx];
          if (isWhite) whiteBishops++;
          else blackBishops++;
          break;
        case 'r':
          psqtBonus = ROOK_TABLE[sqIdx];
          break;
        case 'q':
          psqtBonus = QUEEN_TABLE[sqIdx];
          break;
        case 'k':
          psqtBonus = KING_TABLE_MID[sqIdx];
          break;
      }

      if (isWhite) {
        materialScore += val;
        positionalScore += psqtBonus;
      } else {
        materialScore -= val;
        positionalScore -= psqtBonus;
      }
    }
  }

  // Bishop pair bonus
  if (whiteBishops >= 2) positionalScore += 50;
  if (blackBishops >= 2) positionalScore -= 50;

  return materialScore + positionalScore;
}

/**
 * Minimax with Alpha-Beta pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoardStatic(chess);
  }

  const moves = chess.moves({ verbose: true });
  // Move ordering: captures and checks first
  moves.sort((a, b) => {
    const scoreA = (a.captured ? PIECE_VALUES[a.captured] * 10 : 0) + (a.san.includes('+') ? 50 : 0);
    const scoreB = (b.captured ? PIECE_VALUES[b.captured] * 10 : 0) + (b.san.includes('+') ? 50 : 0);
    return scoreB - scoreA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Full Position Evaluation and Candidate Moves generator
 */
export function evaluatePosition(chess: Chess, searchDepth: number = 3): EngineEvaluationResult {
  const isWhiteTurn = chess.turn() === 'w';
  const staticScore = evaluateBoardStatic(chess);
  const moves = chess.moves({ verbose: true });

  if (chess.isCheckmate()) {
    return {
      score: isWhiteTurn ? -30000 : 30000,
      displayScore: isWhiteTurn ? '#-0' : '#+0',
      mate: isWhiteTurn ? -1 : 1,
      bestMove: null,
      bestMoveSan: null,
      depth: searchDepth,
      principalVariation: [],
      candidateMoves: [],
      tacticsSummary: 'Checkmate on board.',
      kingSafety: {
        white: isWhiteTurn ? 'Critical' : 'Secure',
        black: isWhiteTurn ? 'Secure' : 'Critical',
      },
      materialBalance: calculateMaterialBalance(chess),
    };
  }

  if (chess.isDraw()) {
    return {
      score: 0,
      displayScore: '0.00',
      mate: null,
      bestMove: null,
      bestMoveSan: null,
      depth: searchDepth,
      principalVariation: [],
      candidateMoves: [],
      tacticsSummary: 'Drawn position.',
      kingSafety: { white: 'Secure', black: 'Secure' },
      materialBalance: calculateMaterialBalance(chess),
    };
  }

  // Calculate scores for candidate moves
  const scoredMoves: Array<{
    move: Move;
    score: number;
    explanation: string;
  }> = [];

  for (const move of moves) {
    chess.move(move);
    const score = minimax(
      chess,
      searchDepth - 1,
      -Infinity,
      Infinity,
      !isWhiteTurn // since we already moved, next is opponent's turn
    );
    chess.undo();

    let reason = 'Solid positional move';
    if (move.captured) reason = `Captures ${move.captured.toUpperCase()} on ${move.to}`;
    if (move.san.includes('+')) reason = `Checks king, demanding response`;
    if (move.san === 'O-O' || move.san === 'O-O-O') reason = `Castles king to safety`;

    scoredMoves.push({
      move,
      score,
      explanation: reason,
    });
  }

  // Sort candidate moves: best for current player
  scoredMoves.sort((a, b) => {
    return isWhiteTurn ? b.score - a.score : a.score - b.score;
  });

  const bestCandidate = scoredMoves[0];
  const evalScore = bestCandidate ? bestCandidate.score : staticScore;

  // Convert centipawns to display format
  let displayScore = (evalScore / 100).toFixed(2);
  if (evalScore > 0) displayScore = `+${displayScore}`;

  // Analyze tactical tension
  const hangingSquares = findHangingPieces(chess);
  let tacticsSummary = 'Balanced tension in the center.';
  if (chess.inCheck()) {
    tacticsSummary = 'King is in check! Immediate response required.';
  } else if (hangingSquares.length > 0) {
    tacticsSummary = `Tension on ${hangingSquares.slice(0, 3).join(', ')}. Examine undefended pieces.`;
  } else if (Math.abs(evalScore) > 300) {
    tacticsSummary = `${evalScore > 0 ? 'White' : 'Black'} has a decisive dynamic advantage.`;
  }

  const candidateMoves = scoredMoves.slice(0, 3).map((item) => ({
    san: item.move.san,
    from: item.move.from,
    to: item.move.to,
    score: item.score,
    explanation: item.explanation,
  }));

  return {
    score: evalScore,
    displayScore,
    mate: null,
    bestMove: bestCandidate ? bestCandidate.move.from + bestCandidate.move.to : null,
    bestMoveSan: bestCandidate ? bestCandidate.move.san : null,
    depth: searchDepth,
    principalVariation: candidateMoves.map((m) => m.san),
    candidateMoves,
    tacticsSummary,
    kingSafety: {
      white: chess.inCheck() && isWhiteTurn ? 'Critical' : 'Secure',
      black: chess.inCheck() && !isWhiteTurn ? 'Critical' : 'Secure',
    },
    materialBalance: calculateMaterialBalance(chess),
  };
}

/**
 * Calculate material counts and difference
 */
export function calculateMaterialBalance(chess: Chess) {
  const board = chess.board();
  let white = 0;
  let black = 0;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece || piece.type === 'k') continue;
      const val = PIECE_VALUES[piece.type] || 0;
      if (piece.color === 'w') white += val;
      else black += val;
    }
  }

  return {
    white: Math.round(white / 100),
    black: Math.round(black / 100),
    difference: Math.round((white - black) / 100),
  };
}

/**
 * Identify squares with potentially undefended or under-attack pieces
 */
function findHangingPieces(chess: Chess): string[] {
  const hanging: string[] = [];
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece && piece.type !== 'k') {
        const square = (String.fromCharCode(97 + f) + (8 - r)) as Square;
        if (chess.isAttacked(square, piece.color === 'w' ? 'b' : 'w')) {
          hanging.push(`${piece.color === 'w' ? 'White' : 'Black'} ${piece.type.toUpperCase()} on ${square}`);
        }
      }
    }
  }
  return hanging;
}

/**
 * Bot move generator with configurable Elo strength
 */
export function getBotMove(
  chess: Chess,
  eloRating: number = 1800
): { from: Square; to: Square; promotion?: string; san: string } | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // For lower Elo (under 1200), introduce occasional randomness / sub-optimal choices
  if (eloRating < 1200) {
    if (Math.random() < 0.35) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion,
        san: randomMove.san,
      };
    }
  }

  const depth = eloRating > 2200 ? 3 : eloRating > 1500 ? 2 : 1;
  const evalResult = evaluatePosition(chess, depth);

  if (evalResult.candidateMoves.length > 0) {
    // Top choice or second choice based on rating
    let chosenIdx = 0;
    if (eloRating < 1600 && evalResult.candidateMoves.length > 1 && Math.random() < 0.4) {
      chosenIdx = 1;
    }
    const targetCandidate = evalResult.candidateMoves[chosenIdx] || evalResult.candidateMoves[0];
    const match = moves.find((m) => m.san === targetCandidate.san);
    if (match) {
      return {
        from: match.from,
        to: match.to,
        promotion: match.promotion,
        san: match.san,
      };
    }
  }

  const fallback = moves[0];
  return {
    from: fallback.from,
    to: fallback.to,
    promotion: fallback.promotion,
    san: fallback.san,
  };
}
