import "./captured-pieces.css"
import { pieceData } from "./pieces";


export default function CapturedPieces (props) {
    const ourTeam = props.ourTeam
    const theirTeam = props.theirTeam
    return (<div className="captured-pieces">
        {
            props.capturedPieces.map(piece => {
                return(<div className="captured-piece"><img draggable="false" src={pieceData[piece.type][(piece.color === "thisSide" ? ourTeam : theirTeam) === "black" ? 0 : 1]}></img></div>)
            })
        }
    </div>)
}