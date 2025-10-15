import "./App.css";
import React, { useState, useEffect } from "react";

function App() {
  const [size, setSize] = useState(4);
  const [board, setBoard] = useState([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [score, setScore] = useState(0);

  const initializeBoard = (boardSize) => {
    const newBoard = Array.from({ length: boardSize }, () =>
      Array(boardSize).fill(0)
    );
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    return newBoard;
  };

  const addRandomTile = (currentBoard) => {
    const emptyCells = [];
    currentBoard.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 0) emptyCells.push([r, c]);
      });
    });
    if (emptyCells.length === 0) return;
    const [x, y] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    currentBoard[x][y] = Math.random() < 0.9 ? 2 : 4;
  };

  const boardsEqual = (b1, b2) => {
    return b1.every((row, r) => {
      return row.every((cell, c) => cell === b2[r][c]);
    });
  };

  const slideLeft = (row) => {
    const newRow = row.filter((num) => num !== 0);
    let mergeScore = 0;
    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2;
        mergeScore += newRow[i];
        newRow[i + 1] = 0;
      }
    }
    const finalRow = newRow.filter((num) => num !== 0);
    while (finalRow.length < size) {
      finalRow.push(0);
    }
    return [finalRow, mergeScore];
  };

  const rotateBoard = (currentBoard) => {
    return currentBoard[0].map((_, index) =>
      currentBoard.map((row) => row[index]).reverse()
    );
  };

  const handleMove = (direction) => {
    if (won || lost) return;
    let newBoard = board.map((row) => [...row]);
    let totalScore = 0;
    let rotations = 0;

    if (direction === "up") rotations = 3;
    else if (direction === "right") rotations = 2;
    else if (direction === "down") rotations = 1;

    for (let i = 0; i < rotations; i++) {
      newBoard = rotateBoard(newBoard);
    }

    newBoard = newBoard.map((row) => {
      const [newRow, mergeScore] = slideLeft(row);
      totalScore += mergeScore;
      return newRow;
    });

    for (let i = 0; i < (4 - rotations) % 4; i++) {
      newBoard = rotateBoard(newBoard);
    }

    addRandomTile(newBoard);
    setScore((prev) => prev + totalScore);
    setBoard(newBoard);

    const hasWon = newBoard.some((row) => row.includes(2048));
    if (hasWon) {
      setWon(true);
    }

    if (!newBoard.flat().includes(0)) {
      const canMove = ["left", "right", "up", "down"].some((dir) => {
        let testBoard = newBoard.map((row) => [...row]);
        let testRotations = 0;
        if (dir === "up") testRotations = 3;
        else if (dir === "right") testRotations = 2;
        else if (dir === "down") testRotations = 1;

        for (let i = 0; i < testRotations; i++) {
          testBoard = rotateBoard(testBoard);
        }

        testBoard = testBoard.map((row) => slideLeft(row)[0]);

        for (let i = 0; i < (4 - testRotations) % 4; i++) {
          testBoard = rotateBoard(testBoard);
        }

        return !boardsEqual(newBoard, testBoard);
      });
      if (!canMove) setLost(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handleMove("left");
      if (e.key === "ArrowRight") handleMove("right");
      if (e.key === "ArrowUp") handleMove("up");
      if (e.key === "ArrowDown") handleMove("down");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, score, lost, won, size]);

  const resetGame = () => {
    setBoard(initializeBoard(size));
    setScore(0);
    setLost(false);
    setWon(false);
  };

  const handleSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    if (newSize >= 4 && newSize <= 10) {
      // Reasonable limit
      setSize(newSize);
      setBoard(initializeBoard(newSize));
      setScore(0);
      setLost(false);
      setWon(false);
    }
  };

  useEffect(() => {
    setBoard(initializeBoard(size));
  }, []);

  const getTileColor = (value) => {
    const colors = {
      2: "#eee4da",
      4: "#ede0c8",
      8: "#f2b179",
      16: "#f59563",
      32: "#f67c5f",
      64: "#f65e3b",
      128: "#edcf72",
      256: "#edcc61",
      512: "#edc850",
      1024: "#edc53f",
      2048: "#edc22e",
    };
    return colors[value] || "#3c3a32";
  };

  return (
    <div className="app">
      <h1>2048 Game</h1>
      <div className="controls">
        <label>
          Board Size (Y x Y):
          <input
            type="number"
            value={size}
            onChange={handleSizeChange}
            min="4"
            max="10"
          />
        </label>
        <div>Score: {score}</div>
        <button onClick={resetGame}>Reset</button>
      </div>
      <div
        className="board"
        style={{ gridTemplateColumns: `repeat(${size}, 100px)` }}
      >
        {board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className="tile"
              style={{
                backgroundColor: cell ? getTileColor(cell) : "#cdc1b4",
                color: cell >= 8 ? "#f9f6f2" : "#776e65",
              }}
            >
              {cell || ""}
            </div>
          ))
        )}
      </div>
      {won && <div className="message">You won! 🎉 Reach 2048.</div>}
      {lost && <div className="message">Game Over! No more moves.</div>}
    </div>
  );
}

export default App;
