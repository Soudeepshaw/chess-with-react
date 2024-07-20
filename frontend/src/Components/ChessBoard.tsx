    import { Color, PieceSymbol, Square } from "chess.js"
    import wp from "../assets/wp.png"
    import wr from "../assets/wr.png"
    import wn from "../assets/wn.png"
    import wb from "../assets/wb.png"
    import wq from "../assets/wq.png"
    import wk from "../assets/wk.png"
    import bp from "../assets/bp.png"
    import br from "../assets/br.png"
    import bn from "../assets/bn.png"
    import bb from "../assets/bb.png"
    import bq from "../assets/bq.png"
    import bk from "../assets/bk.png"
    
    const pieceImages: Record<string, string> = {
        'wp': wp,
        'wr': wr,
        'wn': wn,
        'wb': wb,
        'wq': wq,
        'wk': wk,
        'bp': bp,
        'br': br,
        'bn': bn,
        'bb': bb,
        'bq': bq,
        'bk': bk
    };

    export const ChessBoard=({board, onSquareClick,playerColor}:{
        board:({
            square:Square;
            type:PieceSymbol;
            color:Color;
            }|null)[][],
            onSquareClick: (square: Square) => void;
            playerColor: string | null;
    })=>{
        return(
            <div className={`chess-board text-white-200 border-8 border-amber-400 bg-cyan-500 shadow-2xl shadow-cyan-500/50 ${playerColor === 'black' ? 'rotate-180' : ''}`}>
                {board.map((row, i)=>(
                    <div key={i} className={`flex ${playerColor === 'black' ? 'flex-row-reverse' : ''}`}>
                        {row.map((square, j)=>(
                            <div key={j} className={`w-16 h-16 ${(i+j)%2===1?'bg-slate-500':'bg-white'}`}
                            onClick={() => onSquareClick(`${String.fromCharCode(97 + j)}${8 - i}` as Square)}>
                                {square ? (
                                <img 
                                    src={pieceImages[`${square.color}${square.type}`]} 
                                    alt={`${square.color}${square.type}`} 
                                    className={`w-full h-full ${playerColor === 'black' ? 'rotate-180' : ''}`}
                                />
                            ) : ""}
                                </div>
                                ))}
                                </div>
                                ))}
                                </div>
                                )
                            }
