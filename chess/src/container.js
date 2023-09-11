import "./container.css"
import CapturedPieces from "./captured-pieces"
import Chessboard from "./chessboard"
import { useState, useRef } from "react"

export default function Container () {
    const [capturedPieces, setCapturedPieces] = useState({enemy:[], allied:[]})
    const ourTeamRef = useRef(Math.random() < 0.5 ? "white" : "black")
    const ourTeam = ourTeamRef.current
    const theirTeam = ourTeam === "white" ? "black" : "white"
    
    return <div className="container">
        <CapturedPieces capturedPieces={capturedPieces.enemy} ourTeam={ourTeam} theirTeam={theirTeam}/>
        <Chessboard setCapturedPieces={setCapturedPieces} capturedPieces={capturedPieces} ourTeam={ourTeam} theirTeam={theirTeam}/>
        <CapturedPieces capturedPieces={capturedPieces.allied} ourTeam={ourTeam} theirTeam={theirTeam}/>
    </div>
}