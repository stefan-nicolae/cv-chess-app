import { pieceData, Pawn, Rook, Knight, Bishop, Queen, King } from "./pieces";

export default function PawnMenu (props) {
    const pieceOptions = [
        new Rook("thisSide"), new Bishop("thisSide"), new Knight("thisSide"), new Queen("thisSide")
    ]
    return(
        <div className="pawn-menu">
        {pieceOptions.map((piece, index) => (
          <div onClick={() => props.promotePawnTo(piece)} className="option" key={index}>
            <img draggable="false"
              src={pieceData[piece.type][(piece.color === "thisSide" ? props.ourTeam : props.theirTeam) === "black" ? 0 : 1]} 
              alt={piece.type} 
            />
          </div>
        ))}
      </div>
      
    )
}