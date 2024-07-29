import { Chess} from 'chess.js';
import { Board, Piece } from '../Components/types'

export class AI {
  private game: Chess;

  constructor(game: Chess) {
    this.game = game;
  }

  minimaxRoot(depth: number): string {
    const newGameMoves = this.game.moves({ verbose: true });
    let bestMove = -9999;
    let bestMoveFound: any;

    for (const move of newGameMoves) {
      this.game.move(move);
      const value = this.minimax(depth - 1, -10000, 10000, false);
      this.game.undo();

      if (value >= bestMove) {
        bestMove = value;
        bestMoveFound = move;
      }
    }

    return bestMoveFound;
  }

  minimax(depth: number, alpha: number, beta: number, isMaximisingPlayer: boolean): number {
    if (depth === 0) {
      return -this.evaluateBoard(this.game.board() as Board);
    }

    const newGameMoves = this.game.moves();

    if (isMaximisingPlayer) {
      let bestMove = -9999;
      for (const move of newGameMoves) {
        this.game.move(move);
        bestMove = Math.max(bestMove, this.minimax(depth - 1, alpha, beta, !isMaximisingPlayer));
        this.game.undo();
        alpha = Math.max(alpha, bestMove);
        if (beta <= alpha) {
          return bestMove;
        }
      }
      return bestMove;
    } else {
      let bestMove = 9999;
      for (const move of newGameMoves) {
        this.game.move(move);
        bestMove = Math.min(bestMove, this.minimax(depth - 1, alpha, beta, !isMaximisingPlayer));
        this.game.undo();
        beta = Math.min(beta, bestMove);
        if (beta <= alpha) {
          return bestMove;
        }
      }
      return bestMove;
    }
  }

  evaluateBoard(board: any[][]): number {
    let totalEvaluation = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        totalEvaluation += this.getPieceValue(board[i][j] as Piece, i, j);
      }
    }
    return totalEvaluation;
  }
  

  getPieceValue(piece: Piece, x: number, y: number): number {
    if (piece === null) {
      return 0;
    }

    const absoluteValue = this.getAbsoluteValue(piece, piece.color === 'w', x, y);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
  }

  private getAbsoluteValue(piece: Piece, isWhite: boolean, x: number, y: number): number {
    switch (piece?.type) {
      case 'p': return 10 + (isWhite ? this.pawnEvalWhite[y][x] : this.pawnEvalBlack[y][x]);
      case 'r': return 50 + (isWhite ? this.rookEvalWhite[y][x] : this.rookEvalBlack[y][x]);
      case 'n': return 30 + this.knightEval[y][x];
      case 'b': return 30 + (isWhite ? this.bishopEvalWhite[y][x] : this.bishopEvalBlack[y][x]);
      case 'q': return 90 + this.evalQueen[y][x];
      case 'k': return 900 + (isWhite ? this.kingEvalWhite[y][x] : this.kingEvalBlack[y][x]);
      default: throw new Error("Unknown piece type: " + piece?.type);
    }
  }

  makeBestMove(): void {
    const bestMove = this.minimaxRoot(3);
    this.game.move(bestMove);
  }

  // Piece-square tables
  private pawnEvalWhite: number[][] = [
    [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
    [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
    [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
    [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
    [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
    [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
    [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
  ];

  private pawnEvalBlack: number[][] = this.reverseArray(this.pawnEvalWhite);

  private knightEval: number[][] = [
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
    [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
    [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
    [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
    [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
    [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
    [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
  ];

  private bishopEvalWhite: number[][] = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
  ];

  private bishopEvalBlack: number[][] = this.reverseArray(this.bishopEvalWhite);

  private rookEvalWhite: number[][] = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
  ];

  private rookEvalBlack: number[][] = this.reverseArray(this.rookEvalWhite);

  private evalQueen: number[][] = [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
  ];

  private kingEvalWhite: number[][] = [
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
    [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
  ];

  private kingEvalBlack: number[][] = this.reverseArray(this.kingEvalWhite);

  private reverseArray(array: number[][]): number[][] {
    return array[0].map((_, colIndex) => array.map(row => row[colIndex]));
  }
}

export const minimaxRoot = (depth: number, game: Chess, _isMaximisingPlayer: boolean): string => {
  const ai = new AI(game);
  return ai.minimaxRoot(depth);
};

export const evaluateBoard = (board: Board): number => {
  const ai = new AI(new Chess());
  return ai.evaluateBoard(board);
};

export const getPieceValue = (piece: Piece, x: number, y: number): number => {
  const ai = new AI(new Chess());
  return ai.getPieceValue(piece, x, y);
};
