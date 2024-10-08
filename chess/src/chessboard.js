import React, { useEffect, useState, useRef } from "react";
import "./chessboard.css";
import { pieceData, Pawn, Rook, Knight, Bishop, Queen, King } from "./pieces";
import PawnMenu from "./pawn-menu";

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
  initialChessboard[0][0] = new Rook("thatSide", [0, 0]);
  initialChessboard[0][1] = new Knight("thatSide", [0, 1]);
  initialChessboard[0][2] = new Bishop("thatSide", [0, 2]);
  initialChessboard[0][3] = new Queen("thatSide", [0, 3]);
  initialChessboard[0][4] = new King("thatSide", [0, 4]);
  initialChessboard[0][5] = new Bishop("thatSide", [0, 5]);
  initialChessboard[0][6] = new Knight("thatSide", [0, 6]);
  initialChessboard[0][7] = new Rook("thatSide", [0, 7]);
  for (let i = 0; i < 8; i++) {
    initialChessboard[1][i] = new Pawn("thatSide", [1, i]);
  }

  initialChessboard[7][0] = new Rook("thisSide", [7, 0]);
  initialChessboard[7][1] = new Knight("thisSide", [7, 1]);
  initialChessboard[7][2] = new Bishop("thisSide", [7, 2]);
  initialChessboard[7][3] = new Queen("thisSide", [7, 3]);
  initialChessboard[7][4] = new King("thisSide", [7, 4]);
  initialChessboard[7][5] = new Bishop("thisSide", [7, 5]);
  initialChessboard[7][6] = new Knight("thisSide", [7, 6]);
  initialChessboard[7][7] = new Rook("thisSide", [7, 7]);
  for (let i = 0; i < 8; i++) {
    initialChessboard[6][i] = new Pawn("thisSide", [6, i]);
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

const pieceToClass = (piece, pieceObject) => {
  return new pieceObject(piece.color, [piece.position[0], piece.position[1]])
}

export default function Chessboard(props) {
  const ourTeam = props.ourTeam
  const theirTeam = props.theirTeam
  const [chessboard, setChessboard] = useState(initializeChessboard());
  const [allowedMovement, setAllowedMovement] = useState([])
  const [draggedPiece, setDraggedPiece] = useState()
  const enemyCheck = useRef(false)
  const touchTargetCol = useRef(0);
  const touchTargetRow = useRef(0);
  const checkCounter = useRef(0)
  const [pawnMenu, togglePawnMenu] = useState(false)
  const newPawnPosition = useRef()
  const leftRookMoved = useRef(false), rightRookMoved = useRef(false), kingMoved = useRef(false)
  const leftCastleAllowed = useRef(false)
  const rightCastleAllowed = useRef(false)


  //if enemy moves
  useEffect(() => {
    if(props.newChessboard) {
      let toggleAllowed = true
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
                if(pawnCheck(pieceClass, "thatSide")) toggleAllowed = false
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

      checkFinal(newChessboard, "their team")
      setChessboard(newChessboard)


      if(toggleAllowed) 
        props.toggleMyTurn()
    }
  }, [props.newChessboard])

  const getAllEnemyAllowedMovement = (chessboard) => {
    let allEnemyAllowedMovement = []
    chessboard.forEach((row) => {
      row.forEach((piece) => {
        if(piece && piece.color === "thatSide") {
          const pieceMovement = filterAllowedMovement(piece, chessboard, "thatSide", true)
          allEnemyAllowedMovement = [...allEnemyAllowedMovement, ...pieceMovement]  
        }
      })
    })
    return allEnemyAllowedMovement
  }

  const findAlliedKing = (newChessboard) => {
    let alliedKing 
    newChessboard.forEach((row) => {
      row.forEach((piece) => {
        if(!alliedKing && piece && piece.type === "King" && piece.color === "thisSide") {
          alliedKing = piece
        }
      })
    })
    return alliedKing
  }

  const filterAllowedMovement = (piece, chessboard, side="thisSide", skip = false) => {
    const z = side === "thisSide" ? 1 : -1
    const otherSide = side === "thisSide" ? "thatSide" : "thisSide"
    let allowedMovementTemp = piece.allowedMovement()
    allowedMovementTemp.sort((a, b) => -a[0] + b[0]);
    for(let i = 0; i < allowedMovementTemp.length; i++) {
      const row = allowedMovementTemp[i][0]
      const col = allowedMovementTemp[i][1]
      const allowedPiece = chessboard[row][col]
      const isPawnCapturing = allowedMovementTemp[i][2]
      if(allowedMovementTemp[i][2]) allowedMovementTemp[i].pop()
  
      if(allowedPiece && allowedPiece.color === side && !skip) {
        allowedMovementTemp[i] = []
      }
      
      if(piece.type === "Pawn" && isPawnCapturing && !allowedPiece && !skip) {
        allowedMovementTemp[i] = []
      }

      if(allowedPiece && allowedPiece.position[0] === piece.position[0] && allowedPiece.position[1] === piece.position[1])
        allowedMovementTemp[i] = []
  
      if(piece.type === "Pawn") {
        if(allowedMovementTemp[i][0] === piece.position[0] - 2*z) {
          if(allowedPiece || chessboard[row + 1*z][col]) {
            allowedMovementTemp[i] = []
          }
        }
      }
  
      if(piece.type === "Pawn" && allowedPiece && allowedPiece.type === "King" && allowedPiece.color === otherSide && allowedPiece.position[0] === piece.position[0] - 1*z && allowedPiece.position[1] === piece.position[1]) {
        allowedMovementTemp[i] = []
      }
  
      if(allowedPiece && piece.type === "Pawn" && allowedMovementTemp[i][1] === piece.position[1] && allowedMovementTemp[i][0] === piece.position[0] - 1*z) {
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
  
    if(piece.type === "King" && kingMoved.current === false && !enemyCheck.current && !skip) {
      const allEnemyAllowedMovement = getAllEnemyAllowedMovement(chessboard)
      if(leftRookMoved.current === false) {
        if(!chessboard[7][1] && !chessboard[7][2] && !chessboard[7][3]) {
          if(!findCommonArrays(allEnemyAllowedMovement, [[7, 1], [7,2], [7, 3]]).length) 
            allowedMovementTemp.push([7, 0])
            leftCastleAllowed.current = true
        }
      }
  
      if(rightRookMoved.current === false) {
        if(!chessboard[7][5] && !chessboard[7][6]) {
          if(!findCommonArrays(allEnemyAllowedMovement, [[7, 5], [7,6]]).length) 
            allowedMovementTemp.push([7, 7])
            rightCastleAllowed.current = true
        }
      }
    }
  
    if(piece.type === "Pawn" && props.enPassantCoord.current) {
      if(piece.position[0] === props.enPassantCoord.current[0]) {
        if(Math.abs(piece.position[1] - props.enPassantCoord.current[1]) === 1) {
          allowedMovementTemp.push([props.enPassantCoord.current[0] - 1, props.enPassantCoord.current[1]])
        }
      }
    }

    return allowedMovementTemp.filter((arr) => arr.length > 0); 
  }
  
  const isEnemyCheckmate = (newChessboard) => {
    let alliedKing = findAlliedKing(newChessboard)
    const allEnemyAllowedMovement = getAllEnemyAllowedMovement(newChessboard)
    const alliedKingAllowedMovement = filterAllowedMovement(alliedKing, newChessboard)
    if(findCommonArrays(allEnemyAllowedMovement, alliedKingAllowedMovement).length === alliedKingAllowedMovement.length &&
     alliedKingAllowedMovement.length > 0 && findCommonArrays(allEnemyAllowedMovement, [alliedKing.position]).length) 
      return {result: 'enemyCheckmate'}
    if(findCommonArrays(allEnemyAllowedMovement, [alliedKing.position]).length && alliedKingAllowedMovement.length === 0) 
      return {result: 'enemyCheckmate'}
    if(findCommonArrays(allEnemyAllowedMovement, [alliedKing.position]).length) 
      return {result: 'enemyCheck', value: alliedKing}
    return false
  }

  const enemyCheckLockedSquareClass = (rowIndex, colIndex, enemyCheck) => {
    if(pawnCheck(chessboard[rowIndex][colIndex])) {
      newPawnPosition.current = [rowIndex, colIndex]
      return " red-piece"
    }
    
    const alliedKingPos = enemyCheck.current
    if(alliedKingPos) {
      if(alliedKingPos[0] === rowIndex && alliedKingPos[1] === colIndex) return " red-piece"
    } else return ""
  }

  function pawnCheck (piece, side = "thisSide") {
    const check = piece.type === "Pawn" && piece.color === side && piece.position[0] === (side === "thisSide" ? 0 : 7)
    if(check)   console.log("pawn check", side)
    return check
  }

  function promotePawnTo (newPawn) {
    const newChessboard = [...chessboard]
    newPawn.position = newPawnPosition.current
    newPawnPosition.current = undefined
    newChessboard[newPawn.position[0]][newPawn.position[1]] = newPawn
    togglePawnMenu(false)
    moveDone(newChessboard, newPawn.position[0], newPawn.position[1])
  }

  function pawnClick (rowIndex, colIndex) {
    const piece = chessboard[rowIndex][colIndex]
    if(pawnCheck(piece)) {
      togglePawnMenu(true)
    }
  }
  
  function checkFinal(newChessboard, team = "our team") {
    // console.log("checking final", team)
      const value = isEnemyCheckmate(newChessboard)
      if(value) {
        switch(value.result) {
          case "enemyCheckmate":
            // console.log("enemycheck")
            props.sendWebSocketMessage({
              "request": "checkmateWinner",
              "value": theirTeam
            })
            props.setWinner(theirTeam)
            break
          case "enemyCheck":
            enemyCheck.current = value.value.position
            // console.log(enemyCheck.current)
            // console.log('enemy-check')
            if(checkCounter.current === 1 || team === "our team") {
              const message = {
                request: "checkmateWinner",
                value: theirTeam,
              };
              // console.log("enemycheckmate")
              props.sendWebSocketMessage(message);
              props.setWinner(theirTeam);
              break
            }
            if(checkCounter.current === 0) checkCounter.current = 1
            break
        }
      } else {
        enemyCheck.current = false
        checkCounter.current = 0
      }
  }

  function moveDone (newChessboard, targetRow, targetCol) {
      setDraggedPiece(null)
      setAllowedMovement([])
      props.sendNewChessboard(newChessboard)
      if(!pawnCheck(newChessboard[targetRow][targetCol])) 
        props.toggleMyTurn()
      checkFinal(newChessboard)
      setChessboard(newChessboard)
  }

  const pixelsToSquare = (pixelX, pixelY) => {
    const size = document.querySelector(".chessboard-cell").clientWidth
    const squareX = Math.floor(pixelX/size)
    const squareY = Math.floor(pixelY/size)
    return [squareX, squareY]    
  }

  const handleDragStart = (e, piece) => {
    if(!piece || piece.color === "thatSide" || !props.isMyTurn || newPawnPosition.current)
    {
      e.preventDefault()
      return false
    }

    if(e.dataTransfer) e.dataTransfer.setData("text/plain", ""); 
    setDraggedPiece(piece)
    setAllowedMovement(filterAllowedMovement(piece, chessboard))
    // setAllowedMovement(filterAllowedMovement(piece, chessboard, "thisSide", true))

    return true
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

    if(draggedPiece.type === "Pawn" && draggedPiece.position[0] === targetRow + 2) {
      props.sendWebSocketMessage(
        {
          "request": "enPassant",
          "value": [7 - targetRow, targetCol]
        }
      )
    }

    if(draggedPiece.type === "Rook") {
      if(draggedPiece.position[0] === 7 && draggedPiece.position[1] === 0) {
        leftRookMoved.current = true
      }
      if(draggedPiece.position[0] === 7 && draggedPiece.position[1] === 7) {
        rightRookMoved.current = true
      }
    }

    const newChessboard = [...chessboard]
    newChessboard[draggedPiece.position[0]][draggedPiece.position[1]] = null
    if(draggedPiece.type === "King") {
      if(leftCastleAllowed.current && targetRow === 7 && targetCol === 0) {
        const leftCastle = chessboard[7][0]
        newChessboard[7][0] = null
        targetRow = 7
        targetCol = 2
        newChessboard[7][3] = leftCastle
      }
      else if (rightCastleAllowed.current && targetRow === 7 && targetCol === 7) {
        const rightCastle = chessboard[7][7]
        newChessboard[7][7] = null
        targetRow = 7
        targetCol = 6
        newChessboard[7][5] = rightCastle
      } 
      leftCastleAllowed.current = false
      rightCastleAllowed.current = false
      kingMoved.current = true
    } 
    draggedPiece.position = [targetRow, targetCol]

   let capturedPiece = newChessboard[targetRow][targetCol] 

    if(draggedPiece.type === "Pawn") {
      if(props.enPassantCoord.current) {
        if(targetRow === props.enPassantCoord.current[0] - 1 && targetCol === props.enPassantCoord.current[1]) {
          capturedPiece = newChessboard[props.enPassantCoord.current[0]][props.enPassantCoord.current[1]]
          newChessboard[props.enPassantCoord.current[0]][props.enPassantCoord.current[1]] = null
        }
      }
    }
    props.enPassantCoord.current = undefined


    if(capturedPiece) {
      const newCapturedPieces = {...props.capturedPieces}
      newCapturedPieces.enemy.push(capturedPiece)
      props.setCapturedPieces(newCapturedPieces)
    }

    newChessboard[targetRow][targetCol] = draggedPiece
    moveDone(newChessboard, targetRow, targetCol)
  };

  const handleTouchStart = () => {
    // console.log("touch start") 
  }

  const handleTouchMove = (e, piece) => {
    if(!handleDragStart(e, piece)) return
    if (e.touches.length === 1) {
      const touchX = e.touches[0].clientX;
      let touchY = e.touches[0].clientY - document.querySelector(".captured-pieces").clientHeight;
      [touchTargetCol.current, touchTargetRow.current] = pixelsToSquare(touchX, touchY)
    }
  }

  const handleTouchEnd = (e) => {
    handleDrop(e, touchTargetRow.current, touchTargetCol.current)
  }

  return (
    <div className="chessboard">
     {pawnMenu ? <PawnMenu theirTeam={theirTeam} ourTeam={ourTeam} promotePawnTo={promotePawnTo}/> : null}
      {chessboard.map((row, rowIndex) => (
        <div key={rowIndex} className="chessboard-row">
              {row.map((piece, colIndex) => {
                let cellColor = ourTeam === "white" ? 
                  (rowIndex + colIndex) % 2  == 0 ? "white-cell" : "gray-cell" :
                  (rowIndex + colIndex) % 2 !== 0 ? "white-cell" : "gray-cell"
                
                if(arrayExistsInLibrary([rowIndex, colIndex], allowedMovement)) cellColor += " red-cell"
                return (
                  <div
                    key={colIndex}
                    className={`chessboard-cell ${cellColor}`}
                    onDragStart={e => handleDragStart(e, piece)}
                    onDragOver={e => handleDragOver(e)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, rowIndex, colIndex)}

                    onTouchStart={handleTouchStart}
                    onTouchMove={e => handleTouchMove(e, piece)}
                    onTouchEnd={e => handleTouchEnd(e)}
                  >
                    <span id="coords">{rowIndex},{colIndex}</span>
                    {piece && (
                      <div onClick={() => pawnClick(rowIndex, colIndex)} 
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
