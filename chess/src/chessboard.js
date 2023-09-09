import React, { useState } from "react";
import "./chessboard.css";
import { pieceData, Piece, Pawn, Rook, Knight, Bishop, Queen, King } from "./pieces";


// Import the Piece classes (Pawn, Rook, Knight, Bishop, Queen, King)
// Make sure the classes are available in the same scope

function arrayExistsInLibrary(array, library) {
  if(library === null) return false
  return library.some(subarray => {
    return subarray.length === array.length && subarray.every((value, index) => value === array[index]);
  });
}

//TODO: The game logic should work with thisSide & thatSide. 

//At the start of the game, the server decides what color is thisSide and what color is thatSide

export default function Chessboard() {
  // Initialize the chessboard state with an 8x8 array of null values
  const initialChessboard = Array.from({ length: 8 }, () =>
    Array(8).fill(null)
  );

  //SHOULD ACTUALLY BE DECIDED BY THE SERVER
  const thisSide = "black"
  const thatSide = thisSide === "white" ? "black" : "white"

  initialChessboard[0][0] = new Rook(thatSide, [0, 0]);
  initialChessboard[0][1] = new Knight(thatSide, [0, 1]);
  initialChessboard[0][2] = new Bishop(thatSide, [0, 2]);
  initialChessboard[0][3] = new Queen(thatSide, [0, 3]);
  initialChessboard[0][4] = new King(thatSide, [0, 4]);
  initialChessboard[0][5] = new Bishop(thatSide, [0, 5]);
  initialChessboard[0][6] = new Knight(thatSide, [0, 6]);
  initialChessboard[0][7] = new Rook(thatSide, [0, 7]);
  for (let i = 0; i < 8; i++) {
    initialChessboard[1][i] = new Pawn(thatSide, [1, i]);
  }

  initialChessboard[7][0] = new Rook(thisSide, [7, 0]);
  initialChessboard[7][1] = new Knight(thisSide, [7, 1]);
  initialChessboard[7][2] = new Bishop(thisSide, [7, 2]);
  initialChessboard[7][3] = new Queen(thisSide, [7, 3]);
  initialChessboard[7][4] = new King(thisSide, [7, 4]);
  initialChessboard[7][5] = new Bishop(thisSide, [7, 5]);
  initialChessboard[7][6] = new Knight(thisSide, [7, 6]);
  initialChessboard[7][7] = new Rook(thisSide, [7, 7]);
  for (let i = 0; i < 8; i++) {
    initialChessboard[6][i] = new Pawn(thisSide, [6, i]);
  }

  const [chessboard, setChessboard] = useState(initialChessboard);
  // const [draggedPiece, setDraggedPiece] = useState(null);
  const [allowedMovement, setAllowedMovement] = useState([])


  const handleDragStart = (e, piece) => {
    e.dataTransfer.setData("text/plain", ""); // Required for Firefox
    console.log("test")
    // setDraggedPiece(piece);
    // if (!draggedPiece) return;
    // setTimeout(() => {
          const allowedMovementTemp = piece.allowedMovement()
          for(let i = 0; i < allowedMovementTemp.length; i++) {
            const row = allowedMovementTemp[i][0]
            const col = allowedMovementTemp[i][1]
            const isPawnCapturing = allowedMovementTemp[i][2]
            if(isPawnCapturing) allowedMovementTemp[i].pop() //get rid of the third element
            //if there's an element & it's thisSide, remove that coord
            // if(chessboard[col][row] && chessboard[col][row].color === thisSide) allowedMovementTemp[i] = []
            //if there's no element & isPawnCapturing is true, remove that coord
            // if(!chessboard[col][row] && isPawnCapturing) allowedMovementTemp[i] = []
          }
          setAllowedMovement(allowedMovementTemp)

    // },100)
  };
  
  const handleDragEnd = () => {
    // setDraggedPiece(null);
    setAllowedMovement(null)
  };

  const handleDragOver = (e, targetRow, targetCol) => {
    e.preventDefault(); // Necessary to allow dropping

  };
  
  const handleDrop = (e, targetRow, targetCol) => {
    e.preventDefault();
  

    // Perform your logic to update the chessboard state here
    // For example, move the piece to the new position
    // Update the state accordingly to reflect the new chessboard state
    // setDraggedPiece(null)

  };

  // Render the chessboard with pieces
  return (
    <div className="chessboard">
      {chessboard.map((row, rowIndex) => (
        <div key={rowIndex} className="chessboard-row">
              {row.map((piece, colIndex) => {
                let cellColor =
                  (rowIndex + colIndex) % 2 === 0 ? "white-cell" : "gray-cell";
                if(arrayExistsInLibrary([rowIndex, colIndex], allowedMovement)) cellColor += " red-cell"
                return (
                  <div
                    key={colIndex}
                    className={`chessboard-cell ${cellColor}`}
                    onDragStart={e => handleDragStart(e, piece)}
                    onDragOver={e => handleDragOver(e, rowIndex, colIndex)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                  >
                    {piece && (
                      <div
                        className={`chess-piece ${
                          piece.color === "white" ? "white" : "black"
                        }`}
                      >
                        <img src={pieceData[piece.type][piece.color === "black" ? 0 : 1]} alt={piece.type} />
                      </div>
                    )}
                  </div>
                );
              })}

        </div>
      ))}
    </div>
  );
  
}
