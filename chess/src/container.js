import "./container.css"
import CapturedPieces from "./captured-pieces"
import Chessboard from "./chessboard"
import { useState, useRef, useEffect } from "react"
import useWebSocket from './network';

export default function Container () {
    const [capturedPieces, setCapturedPieces] = useState({enemy:[], allied:[]})
    const [partner, setPartner] = useState(false)
    const inputRef = useRef(null);
    const roomJoined = useRef(false)
    const roomIDRequested = useRef(false);
    const colorRequested = useRef(false);
    const ourTeam = useRef(null);
    const theirTeam = useRef(null);

    const onReceive = (receivedMessage) =>  {
        console.log("RECEIVED " + receivedMessage)
        receivedMessage = JSON.parse(receivedMessage)
        switch(receivedMessage.response) {
            case "roomID":
                setRoomID(receivedMessage.value)
                break 
            case "roomError":
                setError(receivedMessage.error)
                break
            case "roomJoined":
                roomJoined.current = true
                setRoomID(receivedMessage.value)
                break
            case "color":
                ourTeam.current = receivedMessage.value
                theirTeam.current = ourTeam.current === "white" ? "black" : "white"
                setPartner(true)
                break
        }
    }
    const { isConnected, sendWebSocketMessage } = useWebSocket(message => onReceive(message, sendWebSocketMessage) );
    const [roomID, setRoomID] = useState()
    const [Error, setError] = useState()

    const joinRoom = () => {
        if (inputRef.current) {
            console.log("joining room")
            const inputValue = inputRef.current.value;
            sendWebSocketMessage(
                {
                    "request": "joinRoom",
                    "value": inputValue
                }
            )
          }
    }

    if(roomJoined.current && !colorRequested.current) {
        colorRequested.current = true
        sendWebSocketMessage({
            "request": "getColor"
        })
    }

    if(isConnected && !roomIDRequested.current && !partner) {
        roomIDRequested.current = true
        sendWebSocketMessage(
            { 
                "request": "requestRoomID"
            }
        )
        return <div className="container">
            <span style={{"color": "white"}}>Finding Room ID...</span>
        </div>
    } 
    
        
    if(isConnected && roomID && !partner) {
        return(
            <div className="container menu">
                <h2>Welcome to the Chess App</h2>
                <h1>Send this ID to anyone to join: {roomID}</h1>    
                <input ref={inputRef} type="text" placeholder="Or join a room yourself"></input>
                <button onClick={() => joinRoom() }>Join Room!</button>
                <span className="error">{Error}</span>
            </div>
        )
    }

    if(isConnected && roomID && partner) return <div className="container">
        <CapturedPieces capturedPieces={capturedPieces.enemy} ourTeam={ourTeam.current} theirTeam={theirTeam.current} roomID={roomID}/>
        <Chessboard setCapturedPieces={setCapturedPieces} capturedPieces={capturedPieces} ourTeam={ourTeam.current} theirTeam={theirTeam.current}/>
        <CapturedPieces capturedPieces={capturedPieces.allied} ourTeam={ourTeam.current} theirTeam={theirTeam.current}/>
    </div>

    return <div className="container">
        <span style={{"color": "white"}}>Connecting to the server...</span>
    </div>
}