/**
 * Minesweeper Game Logic
 * Implements core game mechanics including board generation, mine placement,
 * cell revealing, win/lose conditions, and game state tracking.
 */

class MinesweeperGame {
    constructor(rows = 10, columns = 10, mines = 15) {
        console.log(`Creating MinesweeperGame with ${rows} rows, ${columns} columns, ${mines} mines`);
        // Game settings
        this.rows = rows;
        this.columns = columns;
        this.mines = mines;
        
        // Game state variables
        this.board = [];
        this.visible = [];
        this.minePositions = [];
        this.firstClick = true;
        this.gameState = GAME_STATES.NEW;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.gameOver = false;
        this.victory = false;
        this.debugMode = true; // Enable debug mode
        
        // Initialize the game
        this.initializeBoard();
        
        if (this.debugMode) {
            this.printBoardState(); // Print initial board state for debugging
        }
    }
    
    // Initialize the game board with empty cells
    initializeBoard() {
        this.board = Array(this.rows).fill().map(() => Array(this.columns).fill(0));
        this.visible = Array(this.rows).fill().map(() => 
            Array(this.columns).fill(CELL_STATES.HIDDEN)
        );
        this.minePositions = [];
        this.flagCount = 0;
        this.revealedCount = 0;
        this.gameState = GAME_STATES.NEW;
        this.firstClick = true;
        
        // Stop timer if it's running
        this.stopTimer();
        this.elapsedTime = 0;
    }
    
    // Place mines on the board, avoiding the first clicked cell
    placeMines(excludeRow, excludeCol) {
        let minesToPlace = this.mines;
        
        while (minesToPlace > 0) {
            const row = getRandomInt(0, this.rows - 1);
            const col = getRandomInt(0, this.columns - 1);
            
            // Skip if this is the excluded cell or if there's already a mine here
            if ((row === excludeRow && col === excludeCol) || this.board[row][col] === -1) {
                continue;
            }
            
            // Place a mine
            this.board[row][col] = -1;
            this.minePositions.push([row, col]);
            minesToPlace--;
        }
        
        // Calculate numbers for all cells
        this.calculateNumbers();
    }
    
    // Calculate the numbers for each cell based on adjacent mines
    calculateNumbers() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                // Skip if this cell has a mine
                if (this.board[row][col] === -1) continue;
                
                // Count adjacent mines
                let mineCount = 0;
                const neighbors = getNeighbors(row, col, this.rows, this.columns);
                
                for (const [nRow, nCol] of neighbors) {
                    if (this.board[nRow][nCol] === -1) {
                        mineCount++;
                    }
                }
                
                this.board[row][col] = mineCount;
            }
        }
    }
    
    // Start the game timer
    startTimer() {
        if (this.timerInterval) return;
        
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const currentTime = Date.now();
            this.elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
            
            // Update the timer in the UI
            const timerElement = document.getElementById('timer');
            if (timerElement) {
                timerElement.textContent = formatTimerDisplay(this.elapsedTime);
            }
        }, 1000);
    }
    
    // Stop the game timer
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    // Reveal a cell at the given position
    revealCell(row, col) {
        if (this.debugMode) {
            console.log(`Revealing cell at [${row},${col}]`);
        }
        
        // Get the cell
        const cell = this.getCellAt(row, col);
        
        // Can't reveal a flagged cell, game over cell, or already revealed cell
        if (!cell || cell.isFlagged || this.gameOver || cell.isRevealed) {
            if (this.debugMode) {
                console.log(`Cannot reveal cell: ${!cell ? 'invalid cell' : 
                    cell.isFlagged ? 'flagged' : this.gameOver ? 'game over' : 'already revealed'}`);
            }
            return false;
        }
        
        // Start the game on first cell reveal
        if (!this.gameStarted) {
            this.startGame(row, col);
        }
        
        // Mark the cell as revealed
        cell.isRevealed = true;
        this.revealedCount++;
        
        // Check if the cell is a mine
        if (cell.isMine) {
            // Game over - player hit a mine
            this.endGame(false);
            
            if (this.debugMode) {
                console.log("Game over - hit a mine!");
                this.printBoardState();
            }
            
            return true;
        }
        
        // If the cell has no adjacent mines, reveal neighbors
        if (cell.adjacentMines === 0) {
            this.revealNeighbors(row, col);
        }
        
        // Check for victory
        if (this.checkVictory()) {
            this.endGame(true);
            
            if (this.debugMode) {
                console.log("Victory!");
                this.printBoardState();
            }
        }
        
        return true;
    }
    
    // Flood fill algorithm to reveal adjacent empty cells
    floodFill(row, col) {
        const neighbors = getNeighbors(row, col, this.rows, this.columns);
        
        for (const [nRow, nCol] of neighbors) {
            // Skip if the cell is already revealed or flagged
            if (this.visible[nRow][nCol] !== CELL_STATES.HIDDEN) {
                continue;
            }
            
            // Reveal the cell
            this.visible[nRow][nCol] = CELL_STATES.REVEALED;
            this.revealedCount++;
            
            // If this is also an empty cell, continue flood fill
            if (this.board[nRow][nCol] === 0) {
                this.floodFill(nRow, nCol);
            }
        }
    }
    
    // Toggle flag on a cell
    toggleFlag(row, col) {
        // Do nothing if the game is over or the cell is already revealed
        if (this.gameState !== GAME_STATES.PLAYING && this.gameState !== GAME_STATES.NEW) {
            return false;
        }
        
        if (this.visible[row][col] === CELL_STATES.REVEALED) {
            return false;
        }
        
        // Start the game if this is the first action
        if (this.gameState === GAME_STATES.NEW) {
            this.gameState = GAME_STATES.PLAYING;
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        // Toggle between hidden, flagged, and question mark
        if (this.visible[row][col] === CELL_STATES.HIDDEN) {
            this.visible[row][col] = CELL_STATES.FLAGGED;
            this.flagCount++;
        } else if (this.visible[row][col] === CELL_STATES.FLAGGED) {
            this.visible[row][col] = CELL_STATES.QUESTION;
            this.flagCount--;
        } else if (this.visible[row][col] === CELL_STATES.QUESTION) {
            this.visible[row][col] = CELL_STATES.HIDDEN;
        }
        
        return true;
    }
    
    // Check if the game has been won
    checkWinCondition() {
        const totalCells = this.rows * this.columns;
        const safeCells = totalCells - this.mines;
        
        // Win condition: all safe cells are revealed
        if (this.revealedCount === safeCells) {
            this.winGame();
        }
    }
    
    // Handle game win
    winGame() {
        this.gameState = GAME_STATES.WON;
        this.stopTimer();
        
        // Flag all remaining mines
        for (const [row, col] of this.minePositions) {
            if (this.visible[row][col] !== CELL_STATES.FLAGGED) {
                this.visible[row][col] = CELL_STATES.FLAGGED;
                this.flagCount++;
            }
        }
        
        // Play win sound
        playSound('win');
        
        // Check for high score
        let difficulty = 'custom';
        
        // Determine if this is a standard difficulty
        const currentSettings = {
            rows: this.rows,
            columns: this.columns,
            mines: this.mines
        };
        
        // Check if current settings match any standard difficulty
        for (const [diffKey, diffSettings] of Object.entries(DIFFICULTY_LEVELS)) {
            if (diffSettings.rows === currentSettings.rows && 
                diffSettings.columns === currentSettings.columns && 
                diffSettings.mines === currentSettings.mines) {
                difficulty = diffKey;
                break;
            }
        }
        
        // Add high score if applicable
        if (gameStorage.isHighScore(difficulty, this.elapsedTime)) {
            gameStorage.addHighScore(difficulty, this.elapsedTime);
        }
    }
    
    // Handle game loss
    loseGame(explodedRow, explodedCol) {
        this.gameState = GAME_STATES.LOST;
        this.stopTimer();
        
        // Reveal all mines
        for (const [row, col] of this.minePositions) {
            if (this.visible[row][col] !== CELL_STATES.FLAGGED) {
                this.visible[row][col] = CELL_STATES.REVEALED;
            }
        }
        
        // Mark the exploded mine
        this.explodedMine = [explodedRow, explodedCol];
        
        // Identify incorrectly flagged cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                if (this.visible[row][col] === CELL_STATES.FLAGGED && this.board[row][col] !== -1) {
                    this.visible[row][col] = 'wrong-flag';
                }
            }
        }
        
        // Play explosion sound
        playSound('explosion');
    }
    
    // Reset the game
    resetGame() {
        this.initializeBoard();
    }
    
    // Provide a hint by revealing a safe cell
    provideHint() {
        // Don't provide hints if the game is over
        if (this.gameState !== GAME_STATES.PLAYING && this.gameState !== GAME_STATES.NEW) {
            return null;
        }
        
        // Create a list of hidden and unflagged cells
        const hiddenCells = [];
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                if (this.visible[row][col] === CELL_STATES.HIDDEN && this.board[row][col] !== -1) {
                    hiddenCells.push([row, col]);
                }
            }
        }
        
        // If there are no safe cells to reveal, return null
        if (hiddenCells.length === 0) {
            return null;
        }
        
        // Pick a random safe cell
        const randomIndex = getRandomInt(0, hiddenCells.length - 1);
        const [hintRow, hintCol] = hiddenCells[randomIndex];
        
        // Play hint sound
        playSound('hint');
        
        // Return the hint cell for UI handling
        return { row: hintRow, col: hintCol };
    }
    
    // Get the current state of the game as an object
    getGameState() {
        return {
            board: deepCopyGrid(this.board),
            visible: deepCopyGrid(this.visible),
            gameState: this.gameState,
            mineCount: this.mines,
            flagCount: this.flagCount,
            elapsedTime: this.elapsedTime,
            explodedMine: this.explodedMine
        };
    }
    
    // Update game settings
    updateSettings(rows, columns, mines) {
        // Validate inputs
        const validSettings = validateCustomSettings(columns, rows, mines);
        this.rows = validSettings.height;
        this.columns = validSettings.width;
        this.mines = validSettings.mines;
        
        // Reinitialize with new settings
        this.initializeBoard();
    }
    
    // Add a debug method to print the board state
    printBoardState() {
        console.log("Current Board State:");
        let boardString = "  ";
        
        // Print column numbers
        for (let col = 0; col < this.columns; col++) {
            boardString += col % 10 + " ";
        }
        
        boardString += "\n";
        
        // Print the board
        for (let row = 0; row < this.rows; row++) {
            boardString += row % 10 + " ";
            
            for (let col = 0; col < this.columns; col++) {
                const cell = this.board[row][col];
                
                if (cell.isRevealed) {
                    if (cell.isMine) {
                        boardString += "💣 ";
                    } else {
                        boardString += (cell.adjacentMines > 0 ? cell.adjacentMines : ".") + " ";
                    }
                } else if (cell.isFlagged) {
                    boardString += "🚩 ";
                } else {
                    boardString += "□ ";
                }
            }
            
            boardString += "\n";
        }
        
        console.log(boardString);
    }
} 