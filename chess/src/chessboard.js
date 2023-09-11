import React, { useState } from "react";
import "./chessboard.css";
import { pieceData, Pawn, Rook, Knight, Bishop, Queen, King } from "./pieces";

const thisSide = "thisSide"
const thatSide = "thatSide"
const enemyKing = new King(thatSide, [0, 4]);

function arrayExistsInLibrary(array, library) {
  if(library === null) return false
  return library.some(subarray => {
    return subarray.length === array.length && subarray.every((value, index) => value === array[index]);
  });
}

const initializeChessboard = () => {
  const initialChessboard = Array.from({ length: 8 }, () =>
  Array(8).fill(null)
  );
  initialChessboard[0][0] = new Rook(thatSide, [0, 0]);
  initialChessboard[0][1] = new Knight(thatSide, [0, 1]);
  initialChessboard[0][2] = new Bishop(thatSide, [0, 2]);
  initialChessboard[0][3] = new Queen(thatSide, [0, 3]);
  initialChessboard[0][4] = enemyKing
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
  return initialChessboard
}

const filterAllowedMovement = (piece, chessboard) => {
  const allowedMovementTemp = piece.allowedMovement()
  allowedMovementTemp.sort((a, b) => -a[0] + b[0]);
  for(let i = 0; i < allowedMovementTemp.length; i++) {
    const row = allowedMovementTemp[i][0]
    const col = allowedMovementTemp[i][1]
    const isPawnCapturing = allowedMovementTemp[i][2]

    if(isPawnCapturing) 
      allowedMovementTemp[i].pop() //get rid of the third element

    if(chessboard[row][col] && chessboard[row][col].color === "thisSide") 
      allowedMovementTemp[i] = []
    
    if(piece.type==="Pawn" && (!chessboard[row][col] || chessboard[row][col].color === "thisSide") && isPawnCapturing) {
      allowedMovementTemp[i] = []
    } 

    if(piece.type==="Pawn" && chessboard[piece.position[0] - 1][piece.position[1]]) {
      if(allowedMovementTemp[i][0] === piece.position[0] - 1 && allowedMovementTemp[i][1] === piece.position[1]) {
        allowedMovementTemp[i] = []
      }
    }

    if (piece.type === "Rook" || piece.type === "Queen") {
      // Check if there are any pieces blocking the horizontal and vertical paths
      if (row !== piece.position[0]) {
        const start = Math.min(row, piece.position[0]);
        const end = Math.max(row, piece.position[0]);
        for (let r = start + 1; r < end; r++) {
          if (chessboard[r][col]) {
            allowedMovementTemp[i] = [];
            break;
          }
        }
      } else if (col !== piece.position[1]) {
        const start = Math.min(col, piece.position[1]);
        const end = Math.max(col, piece.position[1]);
        for (let c = start + 1; c < end; c++) {
          if (chessboard[row][c]) {
            allowedMovementTemp[i] = [];
            break;
          }
        }
      }
    }

    if (piece.type === "King") {
      // Implement King's movement restrictions (1 square in any direction)
      const rowDiff = Math.abs(row - piece.position[0]);
      const colDiff = Math.abs(col - piece.position[1]);
      if (rowDiff > 1 || colDiff > 1) {
        allowedMovementTemp[i] = [];
      }
    }
    
    if (piece.type === "Bishop" || piece.type === "Queen") {
      // Check if there are any pieces blocking the diagonal paths
      const rowDiff = Math.abs(row - piece.position[0]);
      const colDiff = Math.abs(col - piece.position[1]);
      if (rowDiff === colDiff) {
        const startRow = Math.min(row, piece.position[0]);
        const endRow = Math.max(row, piece.position[0]);
        const startCol = Math.min(col, piece.position[1]);
        const endCol = Math.max(col, piece.position[1]);
        for (let r = startRow + 1, c = startCol + 1; r < endRow; r++, c++) {
          if (chessboard[r][c]) {
            allowedMovementTemp[i] = [];
            break;
          }
        }
      }
    } 
  }
  return allowedMovementTemp
}

const isAlliedCheckmate = (chessboard) => {
  const enemyKingAllowedMovement = filterAllowedMovement(enemyKing, chessboard)
  for(let r = 0; r<8; r++) {
    for(let c = 0; c < 8; c++) {
      const alliedAllowedMovement = filterAllowedMovement(chessboard[r][c], chessboard)
      alliedAllowedMovement.forEach(a => {
        for(let i = 0; i<enemyKingAllowedMovement; i++) {
          if(enemyKingAllowedMovement[i][0] === a[0] && enemyKingAllowedMovement[i][1] === a[1]) {
            enemyKingAllowedMovement.splice(i, 1)
          }
        }
      })
    }
  }
  return enemyKingAllowedMovement.length 
}

export default function Chessboard(props) {
  const ourTeam = props.ourTeam
  const theirTeam = props.theirTeam
  const [chessboard, setChessboard] = useState(initializeChessboard());
  const [allowedMovement, setAllowedMovement] = useState([])
  const [draggedPiece, setDraggedPiece] = useState()

  const handleDragStart = (e, piece) => {
    if(piece.color === "thatSide")  {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData("text/plain", ""); // Required for Firefox
    setDraggedPiece(piece)
    setAllowedMovement(filterAllowedMovement(piece, chessboard))
  };
  
  const handleDragEnd = () => {
    setAllowedMovement(null)
  };

  const handleDragOver = (e, targetRow, targetCol) => {
    e.preventDefault(); // Necessary to allow dropping
  };
  
  const handleDrop = (e, targetRow, targetCol) => {
    e.preventDefault();
    const isMoveAllowed = allowedMovement.some(move => {
      return move[0] === targetRow && move[1] === targetCol;
    });   
    if(!isMoveAllowed) return
    const newChessboard = [...chessboard]
    newChessboard[draggedPiece.position[0]][draggedPiece.position[1]] = null
    draggedPiece.position = [targetRow, targetCol]

    const capturedPiece = newChessboard[targetRow][targetCol] 
    if(capturedPiece) {
      const newCapturedPieces = {...props.capturedPieces}
      newCapturedPieces.enemy.push(capturedPiece)
      props.setCapturedPieces(newCapturedPieces)
    }

    newChessboard[targetRow][targetCol] = draggedPiece
    setDraggedPiece(null)
    setAllowedMovement([])
    setChessboard(newChessboard)
  };

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
                          piece.color === "thisSide" ? "user" : ""
                        }`}
                      >
                        <img src={pieceData[piece.type][(piece.color === "thisSide" ? ourTeam : theirTeam) === "black" ? 0 : 1]} alt={piece.type} />
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
