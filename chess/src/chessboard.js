import React, { useEffect, useState } from "react";
import "./chessboard.css";
import { pieceData, Pawn, Rook, Knight, Bishop, Queen, King } from "./pieces";

const thisSide = "thisSide"
const thatSide = "thatSide"

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
  return initialChessboard
}

const checkDiag = (piecePos, allowedPiecePos) => {
  const rowDiff = piecePos[0] - allowedPiecePos[0]
  const colDiff = piecePos[1] - allowedPiecePos[1]
  if(Math.abs(rowDiff) === Math.abs(colDiff)) {
    if(rowDiff > 0 && colDiff > 0) return "TopLeft"
    if(rowDiff > 0 && colDiff < 0) return "TopRight"
    if(rowDiff < 0 && colDiff > 0) return "BottomLeft"
    if(rowDiff < 0 && colDiff < 0) return "BottomRight" 
  }
  return false
}

const truncateAMDiag = (AM, allowedPiece, allowedPieceDiagPos) => {
  const newAM = []
  AM.forEach(coords => {
    if(allowedPieceDiagPos !== checkDiag(allowedPiece.position, coords)) {
      newAM.push(coords)
    }
  })
  return newAM
}

const truncateAMStraight = (AM, rowLimitTop, rowLimitBot, colLimitLeft, colLimitRight, piece) => {
  const newAM = []
  AM.forEach(coords => {
    let insert = true
    if(rowLimitTop !== null && coords[0] < rowLimitTop) insert = false
    if(rowLimitBot !== null && coords[0] > rowLimitBot) insert = false
    if(colLimitLeft !== null && coords[1] < colLimitLeft) insert = false
    if(colLimitRight !== null && coords[1] > colLimitRight) insert = false
    if(checkDiag(piece.position, coords)) insert = true
    if(insert) { 
      newAM.push(coords)
    }
  })
  return newAM  
}

const filterAllowedMovement = (piece, chessboard) => {
  let allowedMovementTemp = piece.allowedMovement()
  allowedMovementTemp.sort((a, b) => -a[0] + b[0]);
  for(let i = 0; i < allowedMovementTemp.length; i++) {
    const row = allowedMovementTemp[i][0]
    const col = allowedMovementTemp[i][1]
    const allowedPiece = chessboard[row][col]
    const isPawnCapturing = allowedMovementTemp[i][2]

    if(!allowedPiece) continue
    if(isPawnCapturing) 
      allowedMovementTemp[i].pop() 

    if(allowedPiece.color === "thisSide") 
      allowedMovementTemp[i] = []
    
    if(piece.type==="Pawn" && (!allowedPiece || allowedPiece.color === "thisSide") && isPawnCapturing) {
      allowedMovementTemp[i] = []
    } 

    if(piece.type==="Pawn" && chessboard[piece.position[0] - 1][piece.position[1]]) {
      if(allowedMovementTemp[i][0] === piece.position[0] - 1 && allowedMovementTemp[i][1] === piece.position[1]) {
        allowedMovementTemp[i] = []
      }
    }
    
    if(piece.type === "Bishop" || piece.type === "Queen" ) {
      const allowedPieceDiagPos = checkDiag(piece.position, allowedPiece.position)
      if(allowedPieceDiagPos) {
        allowedMovementTemp = truncateAMDiag(allowedMovementTemp, allowedPiece, allowedPieceDiagPos)
      }
    }
    
		
  }
  if(piece.type === "Rook" || piece.type === "Queen") {
    const pieceRow = piece.position[0]
    const pieceCol = piece.position[1]
    let rowLimitTop=null, rowLimitBot=null, colLimitLeft=null, colLimitRight=null
    for (let row = pieceRow + 1; row < 8; row++) {
      if(chessboard[row][pieceCol]) { 
        rowLimitBot = row 
        break
      }
    }

    for (let row = pieceRow - 1; row >= 0; row--) {
      if(chessboard[row][pieceCol]) { 
        rowLimitTop = row 
        break
      }
    }

    for (let col = pieceCol - 1; col >= 0; col--) {
      if (chessboard[pieceRow][col]) {
        colLimitLeft = col;
        break;
      }
    }

    for (let col = pieceCol + 1; col < 8; col++) {
      if (chessboard[pieceRow][col]) {
        colLimitRight = col;
        break;
      }
    }

    allowedMovementTemp = truncateAMStraight(allowedMovementTemp, rowLimitTop, rowLimitBot, colLimitLeft, colLimitRight, piece)
  }
  return allowedMovementTemp
}

const pieceToClass = (piece, pieceObject) => {
  return new pieceObject(piece.color, [piece.position[0], piece.position[1]])
}

const isEnemyCheckmate = (chessboard) => {
  let enemyKing
  chessboard.forEach((row) => {
    row.forEach((piece) => {
      if(piece && piece.type === "King" && piece.color === "thatSide") {
        enemyKing = piece
        return
      }
    })
  })
  console.log(enemyKing)
}

export default function Chessboard(props) {
  const ourTeam = props.ourTeam
  const theirTeam = props.theirTeam
  const [chessboard, setChessboard] = useState(initializeChessboard());
  const [allowedMovement, setAllowedMovement] = useState([])
  const [draggedPiece, setDraggedPiece] = useState()

  useEffect(() => {
    if(props.newChessboard) {
      const newChessboard = Array.from({ length: 8 }, () =>
        Array(8).fill(null)
      );
      if(props.newChessboard) JSON.parse(props.newChessboard).forEach((row => {
        row.forEach(piece => {
          if(piece !== null) {
            let pieceClass 
            switch(piece.type) {
              case "Pawn":
                pieceClass = pieceToClass(piece, Pawn);
                break;
              case "Rook":
                pieceClass = pieceToClass(piece, Rook);
                break;
              case "Knight":
                pieceClass = pieceToClass(piece, Knight);
                break;
              case "Bishop":
                pieceClass = pieceToClass(piece, Bishop);
                break;
              case "Queen":
                pieceClass = pieceToClass(piece, Queen);
                break;
              case "King":
                pieceClass = pieceToClass(piece, King);
                break;
            }
            newChessboard[piece.position[0]][piece.position[1]] = pieceClass
          }
        })
      }))
      isEnemyCheckmate(chessboard)
      setChessboard(newChessboard)
    }
  }, [props.newChessboard])

  const handleDragStart = (e, piece) => {
    if(piece.color === "thatSide" || !props.isMyTurn)  {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData("text/plain", ""); 
    setDraggedPiece(piece)
    setAllowedMovement(filterAllowedMovement(piece, chessboard))
  };
  
  const handleDragEnd = () => {
    setAllowedMovement(null)
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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
    props.sendNewChessboard(newChessboard)
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
                    onDragOver={e => handleDragOver(e)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                  >
                    <span id="coords">{rowIndex}, {colIndex}</span>
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
