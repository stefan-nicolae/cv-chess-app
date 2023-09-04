import bishopBlack from "./pieces/bishop-black.png";
import bishopWhite from "./pieces/bishop-white.png";
import kingBlack from "./pieces/king-black.png";
import kingWhite from "./pieces/king-white.png";
import knightBlack from "./pieces/knight-black.png";
import knightWhite from "./pieces/knight-white.png";
import pawnBlack from "./pieces/pawn-black.png";
import pawnWhite from "./pieces/pawn-white.png";
import queenBlack from "./pieces/queen-black.png";
import queenWhite from "./pieces/queen-white.png";
import rookBlack from "./pieces/rook-black.png";
import rookWhite from "./pieces/rook-white.png";

class Piece {
  constructor(color, position) {
    this.color = color;
    this.position = position || [undefined, undefined]; // [row, column]
  }

  allowedMovement() {
    // Subclasses will implement this method to return an array of allowed moves
    return [];
  }
}

class Pawn extends Piece {
  constructor(color, position) {
    super(color, position);
    this.type = "Pawn";
  }

  allowedMovement() {
    const [currentRow, currentCol] = this.position;
    const direction = this.color === "white" ? 1 : -1;
    const allowedMoves = [];

    // Pawns can move one square forward
    allowedMoves.push([currentRow + direction, currentCol]);

    // Pawns can move two squares forward on their first move
    if (
      (currentRow === 1 && this.color === "white") ||
      (currentRow === 6 && this.color === "black")
    ) {
      allowedMoves.push([currentRow + 2 * direction, currentCol]);
    }

    // Pawns can capture diagonally
    allowedMoves.push([currentRow + direction, currentCol - 1]);
    allowedMoves.push([currentRow + direction, currentCol + 1]);

    // Filter out invalid moves (e.g., outside the board)
    return allowedMoves.filter(([newRow, newCol]) => {
      return newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7;
    });
  }
}

class Rook extends Piece {
  constructor(color, position) {
    super(color, position);
    this.type = "Rook";
  }

  allowedMovement() {
    const [currentRow, currentCol] = this.position;
    const allowedMoves = [];

    // Rooks can move horizontally
    for (let newRow = 0; newRow < 8; newRow++) {
      if (newRow !== currentRow) {
        allowedMoves.push([newRow, currentCol]);
      }
    }

    // Rooks can move vertically
    for (let newCol = 0; newCol < 8; newCol++) {
      if (newCol !== currentCol) {
        allowedMoves.push([currentRow, newCol]);
      }
    }

    return allowedMoves;
  }
}

class Knight extends Piece {
  constructor(color, position) {
    super(color, position);
    this.type = "Knight";
  }

  allowedMovement() {
    const [currentRow, currentCol] = this.position;
    const allowedMoves = [];

    // Knights can move in an L-shape (2 squares in one direction and 1 square in the other)
    const moves = [
      [currentRow - 2, currentCol - 1],
      [currentRow - 2, currentCol + 1],
      [currentRow - 1, currentCol - 2],
      [currentRow - 1, currentCol + 2],
      [currentRow + 1, currentCol - 2],
      [currentRow + 1, currentCol + 2],
      [currentRow + 2, currentCol - 1],
      [currentRow + 2, currentCol + 1],
    ];

    // Filter out invalid moves (e.g., outside the board)
    return moves.filter(([newRow, newCol]) => {
      return newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7;
    });
  }
}

class Bishop extends Piece {
  constructor(color, position) {
    super(color, position);
    this.type = "Bishop";
  }

  allowedMovement() {
    const [currentRow, currentCol] = this.position;
    const allowedMoves = [];

    // Bishops can move diagonally
    for (let newRow = 0; newRow < 8; newRow++) {
      for (let newCol = 0; newCol < 8; newCol++) {
        if (
          Math.abs(newRow - currentRow) === Math.abs(newCol - currentCol) &&
          newRow !== currentRow
        ) {
          allowedMoves.push([newRow, newCol]);
        }
      }
    }

    return allowedMoves;
  }
}

class Queen extends Piece {
  constructor(color, position) {
    super(color, position);
    this.type = "Queen";
  }

  allowedMovement() {
    const [currentRow, currentCol] = this.position;
    const allowedMoves = [];

    // Queens can move horizontally, vertically, or diagonally
    for (let newRow = 0; newRow < 8; newRow++) {
      for (let newCol = 0; newCol < 8; newCol++) {
        if (
          newRow === currentRow ||
          newCol === currentCol ||
          Math.abs(newRow - currentRow) === Math.abs(newCol - currentCol)
        ) {
          allowedMoves.push([newRow, newCol]);
        }
      }
    }

    return allowedMoves;
  }
}

class King extends Piece {
  constructor(color, position) {
    super(color, position);
    this.type = "King";
  }

  allowedMovement() {
    const [currentRow, currentCol] = this.position;
    const allowedMoves = [];

    // Kings can move one square in any direction
    for (let newRow = currentRow - 1; newRow <= currentRow + 1; newRow++) {
      for (let newCol = currentCol - 1; newCol <= currentCol + 1; newCol++) {
        if (newRow !== currentRow || newCol !== currentCol) {
          allowedMoves.push([newRow, newCol]);
        }
      }
    }

    // Filter out invalid moves (e.g., outside the board)
    return allowedMoves.filter(([newRow, newCol]) => {
      return newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7;
    });
  }
}


const pieceData = {
  Pawn: [pawnBlack, pawnWhite],
  Bishop: [bishopBlack, bishopWhite],
  King: [kingBlack, kingWhite],
  Knight: [knightBlack, knightWhite],
  Queen: [queenBlack, queenWhite],
  Rook: [rookBlack, rookWhite],
};

export { pieceData, Piece, Pawn, Rook, Knight, Bishop, Queen, King };
