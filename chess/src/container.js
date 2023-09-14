import "./container.css"
import CapturedPieces from "./captured-pieces"
import Chessboard from "./chessboard"
import { useState, useRef, useEffect } from "react"
import useWebSocket from './network';

function flipChessboard(chessboard, thisSide, thatSide) {
    // Create a deep copy of the original chessboard
    const flippedChessboard = JSON.parse(JSON.stringify(chessboard));
  
    // Swap the rows to flip the chessboard
    flippedChessboard.reverse();
  
    // Update the references to piece objects and their colors
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = flippedChessboard[row][col];
        if (piece) {
          // Update the position of the piece
          piece.position = [row, col];
  
          // Update the color of the piece based on which side it belongs to
          piece.color = piece.color === thisSide ? thatSide : thisSide;
        }
      }
    }
  
    return flippedChessboard;
  }
  

export default function Container () {
    const [capturedPieces, setCapturedPieces] = useState({enemy:[], allied:[]})
    const [partner, setPartner] = useState(false)
    const [newChessboard, setNewChessboard] = useState()
    const inputRef = useRef(null);
    const roomIDRequested = useRef(false);
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
                setRoomID(receivedMessage.value)
                break
            case "color":
                ourTeam.current = receivedMessage.value
                theirTeam.current = ourTeam.current === "white" ? "black" : "white"
                setPartner(true)
                break
            case "newChessboard":
                setNewChessboard(receivedMessage.value);
                break
        }
    }

    const { isConnected, sendWebSocketMessage } = useWebSocket(onReceive);
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

    const sendNewChessboard = (newChessboard) => {
        console.log(newChessboard)
        // sendWebSocketMessage({
        //     "request": "newChessboard",
        //     "value": JSON.stringify(flipChessboard(newChessboard))
        // })
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
        <Chessboard setCapturedPieces={setCapturedPieces} capturedPieces={capturedPieces} ourTeam={ourTeam.current} 
            theirTeam={theirTeam.current} sendNewChessboard={sendNewChessboard}  newChessboard={newChessboard}/>
        <CapturedPieces capturedPieces={capturedPieces.allied} ourTeam={ourTeam.current} theirTeam={theirTeam.current}/>
    </div>

    return <div className="container">
        <span style={{"color": "white"}}>Connecting to the server...</span>
    </div>
}