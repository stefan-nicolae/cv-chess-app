import "./captured-pieces.css"
import { pieceData } from "./pieces";

export default function CapturedPieces (props) {
    const ourTeam = props.ourTeam
    const theirTeam = props.theirTeam
    const numDummySquares = 16 - props.capturedPieces.length;

    const dummySquares = Array.from({ length: numDummySquares }, (_, index) => ({
        type: "dummy", 
        color: "dummy",
    }));

    console.log(props.retrievablePieces)

    return (
        <div className="captured-pieces">
            {props.capturedPieces.map((piece, index) => (
            <div key={index} className={`captured-piece`}>  
                <img
                draggable="false"
                src={pieceData[piece.type][
                    (piece.color === "thisSide" ? ourTeam : theirTeam) === "black" ? 0 : 1
                ]}
                />
            </div>
            ))}

            {dummySquares.map((dummySquare, index) => (
            <div key={`dummy-${index}`} className="captured-piece dummy">
                <div className="dummy-content"></div>
            </div>
            ))}
        </div>
    );
}