import { Square, Piece as ChessPiece } from 'chess.js';

export type Board = (ChessPiece | null)[][];

export type Piece = ChessPiece | null;
export type { Square };


export type Color = 'w' | 'b';

export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
}

export interface GameState {
  board: Board;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
}

export interface Player {
  color: Color;
  isAI: boolean;
}
