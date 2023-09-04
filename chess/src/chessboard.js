import React, { useState } from "react";
import "./chessboard.css";
import { pieceData, Piece, Pawn, Rook, Knight, Bishop, Queen, King } from "./pieces";


// Import the Piece classes (Pawn, Rook, Knight, Bishop, Queen, King)
// Make sure the classes are available in the same scope

export default function Chessboard() {
  // Initialize the chessboard state with an 8x8 array of null values
  const initialChessboard = Array.from({ length: 8 }, () =>
    Array(8).fill(null)
  );

  // White pieces
  initialChessboard[0][0] = new Rook("white", [0, 0]);
  initialChessboard[0][1] = new Knight("white", [0, 1]);
  initialChessboard[0][2] = new Bishop("white", [0, 2]);
  initialChessboard[0][3] = new Queen("white", [0, 3]);
  initialChessboard[0][4] = new King("white", [0, 4]);
  initialChessboard[0][5] = new Bishop("white", [0, 5]);
  initialChessboard[0][6] = new Knight("white", [0, 6]);
  initialChessboard[0][7] = new Rook("white", [0, 7]);
  for (let i = 0; i < 8; i++) {
    initialChessboard[1][i] = new Pawn("white", [1, i]);
  }

  // Black pieces
  initialChessboard[7][0] = new Rook("black", [7, 0]);
  initialChessboard[7][1] = new Knight("black", [7, 1]);
  initialChessboard[7][2] = new Bishop("black", [7, 2]);
  initialChessboard[7][3] = new Queen("black", [7, 3]);
  initialChessboard[7][4] = new King("black", [7, 4]);
  initialChessboard[7][5] = new Bishop("black", [7, 5]);
  initialChessboard[7][6] = new Knight("black", [7, 6]);
  initialChessboard[7][7] = new Rook("black", [7, 7]);
  for (let i = 0; i < 8; i++) {
    initialChessboard[6][i] = new Pawn("black", [6, i]);
  }

  const [chessboard, setChessboard] = useState(initialChessboard);
  const [draggedPiece, setDraggedPiece] = useState(null);


  const handleDragStart = (e, piece) => {
    e.dataTransfer.setData("text/plain", ""); // Required for Firefox
    setDraggedPiece(piece);
  };
  
  const handleDragEnd = () => {
    setDraggedPiece(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };
  
  const handleDrop = (e, targetRow, targetCol) => {
    e.preventDefault();
    
    if (!draggedPiece) return;
    console.log([targetRow, targetCol, draggedPiece])
    const allowedMovement = draggedPiece.allowedMovement()
    
    
    // Perform your logic to update the chessboard state here
    // For example, move the piece to the new position
    // Update the state accordingly to reflect the new chessboard state
    // Don't forget to setDraggedPiece(null) to clear the dragged piece state
    setDraggedPiece(null)
  };

  // Render the chessboard with pieces
  return (
    <div className="chessboard">
      {chessboard.map((row, rowIndex) => (
        <div key={rowIndex} className="chessboard-row">
              {row.map((piece, colIndex) => {
                const cellColor =
                  (rowIndex + colIndex) % 2 === 0 ? "white-cell" : "gray-cell";

                return (
                  <div
                    key={colIndex}
                    className={`chessboard-cell ${cellColor}`}
                    onDragStart={e => handleDragStart(e, piece)}
                    onDragOver={e => handleDragOver(e)}
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
