import "./container.css"
import CapturedPieces from "./captured-pieces"
import Chessboard from "./chessboard"
import { useState, useRef, useEffect } from "react"
import useWebSocket from './network';

function flipChessboard(chessboard) {
    const flippedChessboard = [];
  
    for (let row = 7; row >= 0; row--) {
      flippedChessboard.push([]);
      for (let col = 7; col >= 0; col--) {
        const piece = chessboard[row][col];
        if (piece !== null) {
          const newPiece = {
            color: piece.color === "thisSide" ? "thatSide" : "thisSide",
            position: [7 - row, 7 - col], 
            type: piece.type 
          };
          flippedChessboard[7 - row][7 - col] = newPiece;
        } else {
          flippedChessboard[7 - row][7 - col] = null;
        }
      }
    }
    return flippedChessboard;
}

export default function Container () {
    const [capturedPieces, setCapturedPieces] = useState({enemy:[], allied:[]})
    const [partner, setPartner] = useState(false)
    const [newChessboard, setNewChessboard] = useState()
    const [isMyTurn, setMyTurn] = useState(false)
    const [winner, setWinner] = useState(false)
    const inputRef = useRef(null);
    const roomIDRequested = useRef(false);
    const ourTeam = useRef(null);
    const theirTeam = useRef(null);
    const skipCapturedPieceRequest = useRef(false)
    
    const queryParams = new URLSearchParams(window.location.search);
    const URLroomID = queryParams.get("roomID");
    
    const toggleMyTurn = () => {
        if(isMyTurn) setMyTurn(false) 
        else setMyTurn(true)
}

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
                toggleMyTurn()
                break
            case "capturedPiece":
                const originalObject = receivedMessage.value 
                const object = JSON.parse(originalObject)
                const temp = object.enemy;
                object.enemy = object.allied;
                object.allied = temp;
                Object.keys(object).forEach(key => {
                    Object.keys(object[key]).forEach(pieceKey => {
                        const piece = object[key][pieceKey]
                        piece.color = piece.color === "thatSide" ? "thisSide" : "thatSide"
                    })
                })
                skipCapturedPieceRequest.current = true
                setCapturedPieces(object)
                break
            case "GAMEOVER":
                setWinner(receivedMessage.winner)
                break
        }
    }

    useEffect(() => {
        if(!skipCapturedPieceRequest.current) {
            sendWebSocketMessage({
                "request": "capturedPiece",
                "value": JSON.stringify(capturedPieces)
            })
        }
        skipCapturedPieceRequest.current = false
    }, [capturedPieces])

    useEffect(() => {
        if(partner && ourTeam.current === "white") {
            setMyTurn(true)
        }
    }, [partner])

    const { isConnected, sendWebSocketMessage } = useWebSocket(onReceive);
    const [roomID, setRoomID] = useState(URLroomID)
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
        sendWebSocketMessage({
            "request": "newChessboard",
            "value": JSON.stringify(flipChessboard(newChessboard))
        })
        toggleMyTurn()
    }

    if(isConnected && !roomIDRequested.current && !partner) {
        roomIDRequested.current = true
        if(URLroomID) {
            sendWebSocketMessage(
                {
                    //IMPLEMENT
                }
            )
        } else {
            sendWebSocketMessage(
                { 
                    "request": "requestRoomID"
                }
            )
        }
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
        {winner ? <div className="game-over">
            <div className="game-over-shadow"></div>
            <div className="game-over-info">
                <h1>Game is Over</h1>
                <h2>{winner } side won</h2>
                <button>Leave Game</button>
            </div>
        </div> : ""}
        <span id="room-id">Room ID = {roomID}</span>
        <CapturedPieces capturedPieces={capturedPieces.enemy} ourTeam={ourTeam.current} theirTeam={theirTeam.current}/>
        <Chessboard setCapturedPieces={setCapturedPieces} capturedPieces={capturedPieces} ourTeam={ourTeam.current} 
            theirTeam={theirTeam.current} sendNewChessboard={sendNewChessboard} newChessboard={newChessboard} isMyTurn={isMyTurn} sendWebSocketMessage={sendWebSocketMessage}/>
        <CapturedPieces capturedPieces={capturedPieces.allied} ourTeam={ourTeam.current} theirTeam={theirTeam.current}/>
    </div>

    return <div className="container">
        <span style={{"color": "white"}}>Connecting to the server...</span>
    </div>
}