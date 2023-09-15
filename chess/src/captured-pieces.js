import "./captured-pieces.css"
import { pieceData } from "./pieces";

export default function CapturedPieces (props) {
    const ourTeam = props.ourTeam
    const theirTeam = props.theirTeam
    const roomID = props.roomID ? `Room ID = ${props.roomID}` : null
    let key = 0
    return (<div className="captured-pieces">
        <span>{roomID}</span>
        {
            props.capturedPieces.map(piece => {
                return(<div key={key++} className="captured-piece"><img draggable="false" src={pieceData[piece.type][(piece.color === "thisSide" ? ourTeam : theirTeam) === "black" ? 0 : 1]}></img></div>)
            })
        }
    </div>)
}