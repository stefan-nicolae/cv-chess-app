import React, { useEffect, useState, useRef } from "react";
import "./chessboard.css";
import { pieceData, Pawn, Rook, Knight, Bishop, Queen, King } from "./pieces";

const thisSide = "thisSide"
const thatSide = "thatSide"

function findCommonArrays(array1, array2) {
  return array1.filter((arr1) =>
    array2.some((arr2) =>
      arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index])
    )
  );
}

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
    if(allowedMovementTemp[i][2]) allowedMovementTemp[i].pop()

    if(allowedPiece && allowedPiece.color === "thisSide") 
      allowedMovementTemp[i] = []
    
    if(piece.type === "Pawn" && isPawnCapturing && !allowedPiece) {
      allowedMovementTemp[i] = []
    }

    if(allowedPiece && piece.type === "Pawn" && allowedMovementTemp[i][1] === piece.position[1] && allowedMovementTemp[i][0] === piece.position[0] - 1) {
      allowedMovementTemp[i] = []
    }

    if(allowedPiece && (piece.type === "Bishop" || piece.type === "Queen" )) {
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

  return allowedMovementTemp.filter((arr) => arr.length > 0); 

}

const pieceToClass = (piece, pieceObject) => {
  return new pieceObject(piece.color, [piece.position[0], piece.position[1]])
}

const isEnemyCheckmate = (chessboard) => {
  let alliedKing
  let allEnemyAllowedMovement = []
  chessboard.forEach((row) => {
    row.forEach((piece) => {
      if(piece && piece.color === "thatSide") {
        const pieceMovement = filterAllowedMovement(piece, chessboard)
        allEnemyAllowedMovement = [...allEnemyAllowedMovement, ...pieceMovement]  
      }
      if(!alliedKing && piece && piece.type === "King" && piece.color === "thisSide") {
        alliedKing = piece
      }
    })
  })
  const alliedKingMovement = filterAllowedMovement(alliedKing, chessboard)
  if(!alliedKingMovement.length) return false
  if(findCommonArrays(allEnemyAllowedMovement, alliedKingMovement).length === alliedKingMovement.length) return {result: 'enemyCheckmate'}
  if(findCommonArrays(allEnemyAllowedMovement, alliedKingMovement).length) return {result: 'enemyCheck', pos: alliedKing.position}
  return false
}

const enemyCheckLockedSquareClass = (rowIndex, colIndex, enemyCheck) => {
  const alliedKingPos = enemyCheck.current
  if(alliedKingPos) {
    if(alliedKingPos[0] === rowIndex && alliedKingPos[1] === colIndex) return " red-piece"
  } else return ""
}

export default function Chessboard(props) {
  const ourTeam = props.ourTeam
  const theirTeam = props.theirTeam
  const [chessboard, setChessboard] = useState(initializeChessboard());
  const [allowedMovement, setAllowedMovement] = useState([])
  const [draggedPiece, setDraggedPiece] = useState()
  const enemyCheck = useRef(false)

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

      const value = isEnemyCheckmate(newChessboard)
      if(value) {
        switch(value.result) {
          case "enemyCheckmate":
            props.sendWebSocketMessage({
              "request": "checkmate",
              "winner": theirTeam
            })
            break
          case "enemyCheck":
            enemyCheck.current = value.pos
            break
        }
      } else {
        enemyCheck.current = false
      }
      setChessboard(newChessboard)
    }
  }, [props.newChessboard])
   
  const handleDragStart = (e, piece) => {
    if(piece.color === "thatSide" || !props.isMyTurn || 
    (enemyCheck.current && !(enemyCheck.current[0] === piece.position[0] && enemyCheck.current[1] === piece.position[1]))) 
    {
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
                        } ${
                          enemyCheckLockedSquareClass(rowIndex, colIndex, enemyCheck)
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
