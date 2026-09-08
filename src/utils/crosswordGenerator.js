// ============================================================
// Crossword Generator Utility
// Generates a crossword grid from a list of words
// ============================================================

const GRID_SIZE = 20;

function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function canPlace(grid, word, row, col, direction) {
  const len = word.length;
  if (direction === 'across') {
    if (col + len > GRID_SIZE) return false;
    for (let i = 0; i < len; i++) {
      const cell = grid[row][col + i];
      if (cell !== null && cell !== word[i]) return false;
      // check above and below for conflicts
      if (cell === null) {
        if (i === 0 && col > 0 && grid[row][col - 1] !== null) return false;
        if (i === len - 1 && col + len < GRID_SIZE && grid[row][col + len] !== null) return false;
        if (row > 0 && grid[row - 1][col + i] !== null && cell === null) return false;
        if (row < GRID_SIZE - 1 && grid[row + 1][col + i] !== null && cell === null) return false;
      }
    }
  } else {
    if (row + len > GRID_SIZE) return false;
    for (let i = 0; i < len; i++) {
      const cell = grid[row + i][col];
      if (cell !== null && cell !== word[i]) return false;
      if (cell === null) {
        if (i === 0 && row > 0 && grid[row - 1][col] !== null) return false;
        if (i === len - 1 && row + len < GRID_SIZE && grid[row + len][col] !== null) return false;
        if (col > 0 && grid[row + i][col - 1] !== null && cell === null) return false;
        if (col < GRID_SIZE - 1 && grid[row + i][col + 1] !== null && cell === null) return false;
      }
    }
  }
  return true;
}

function placeWord(grid, word, row, col, direction) {
  const newGrid = grid.map(r => [...r]);
  for (let i = 0; i < word.length; i++) {
    if (direction === 'across') newGrid[row][col + i] = word[i];
    else newGrid[row + i][col] = word[i];
  }
  return newGrid;
}

function findIntersections(grid, word, direction) {
  const positions = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (canPlace(grid, word, row, col, direction)) {
        // Score: prefer intersections
        let intersections = 0;
        for (let i = 0; i < word.length; i++) {
          const r = direction === 'down' ? row + i : row;
          const c = direction === 'across' ? col + i : col;
          if (grid[r][c] === word[i]) intersections++;
        }
        if (intersections > 0) {
          positions.push({ row, col, direction, intersections });
        }
      }
    }
  }
  return positions;
}

export function generateCrossword(wordList) {
  let grid = createEmptyGrid(GRID_SIZE);
  const placed = [];

  // Sort by length descending
  const words = [...wordList].sort((a, b) => b.answer.length - a.answer.length);

  for (let wi = 0; wi < words.length; wi++) {
    const wordData = words[wi];
    const word = wordData.answer.toUpperCase();

    if (wi === 0) {
      // Place first word in center horizontally
      const startCol = Math.floor((GRID_SIZE - word.length) / 2);
      const startRow = Math.floor(GRID_SIZE / 2);
      grid = placeWord(grid, word, startRow, startCol, 'across');
      placed.push({
        ...wordData,
        word,
        row: startRow,
        col: startCol,
        direction: 'across',
        number: placed.length + 1,
      });
      continue;
    }

    // Try to find intersections
    const directions = ['across', 'down'];
    let bestPos = null;
    let bestScore = -1;

    for (const direction of directions) {
      const positions = findIntersections(grid, word, direction);
      for (const pos of positions) {
        if (pos.intersections > bestScore) {
          bestScore = pos.intersections;
          bestPos = pos;
        }
      }
    }

    if (!bestPos) {
      // Try without intersections
      for (const direction of directions) {
        let placed_flag = false;
        for (let row = 1; row < GRID_SIZE - 1 && !placed_flag; row++) {
          for (let col = 1; col < GRID_SIZE - 1 && !placed_flag; col++) {
            if (canPlace(grid, word, row, col, direction)) {
              bestPos = { row, col, direction };
              placed_flag = true;
            }
          }
        }
        if (placed_flag) break;
      }
    }

    if (bestPos) {
      grid = placeWord(grid, word, bestPos.row, bestPos.col, bestPos.direction);
      placed.push({
        ...wordData,
        word,
        row: bestPos.row,
        col: bestPos.col,
        direction: bestPos.direction,
        number: placed.length + 1,
      });
    }
  }

  // Trim grid to content
  let minRow = GRID_SIZE, maxRow = 0, minCol = GRID_SIZE, maxCol = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== null) {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }

  const trimmedGrid = grid
    .slice(minRow, maxRow + 1)
    .map(row => row.slice(minCol, maxCol + 1));

  // Adjust word positions
  const adjustedWords = placed.map(w => ({
    ...w,
    row: w.row - minRow,
    col: w.col - minCol,
  }));

  return { grid: trimmedGrid, words: adjustedWords };
}
