/**
 * Simplified Minesweeper Game Logic
 * This version is designed to be more robust and compatible with the UI
 */

class MinesweeperGame {
    constructor(rows, columns, mines) {
        console.log(`Creating simplified MinesweeperGame: ${rows}×${columns}, ${mines} mines`);
        
        // Game settings
        this.rows = rows;
        this.columns = columns;
        this.mines = mines;
        
        // Game state
        this.board = []; // Holds mine values: -1 for mine, 0-8 for adjacent mines
        this.visible = []; // Tracks revealed/flagged state
        this.gameState = GAME_STATES.NEW;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.firstClick = true;
        this.explodedMine = null;
        
        // Timer
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        
        // Initialize the board
        this.initializeBoard();
    }
    
    // Initialize the board with empty cells
    initializeBoard() {
        console.log("Initializing board");
        
        // Reset all game state variables
        this.board = Array(this.rows).fill().map(() => Array(this.columns).fill(0));
        this.visible = Array(this.rows).fill().map(() => 
            Array(this.columns).fill(CELL_STATES.HIDDEN)
        );
        this.minePositions = [];
        this.flagCount = 0;
        this.revealedCount = 0;
        this.gameState = GAME_STATES.NEW;
        this.firstClick = true;
        this.explodedMine = null;
        
        // Stop timer if it's running
        this.stopTimer();
        this.elapsedTime = 0;
    }
    
    // Place mines on the board, avoiding the first clicked cell
    placeMines(excludeRow, excludeCol) {
        console.log(`Placing ${this.mines} mines (excluding ${excludeRow},${excludeCol})`);
        
        let minesToPlace = this.mines;
        this.minePositions = [];
        
        while (minesToPlace > 0) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.columns);
            
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
        
        console.log(`Placed ${this.mines} mines, board ready`);
    }
    
    // Calculate the numbers for each cell based on adjacent mines
    calculateNumbers() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                // Skip if this cell has a mine
                if (this.board[row][col] === -1) continue;
                
                // Count adjacent mines
                let mineCount = 0;
                const neighbors = this.getNeighbors(row, col);
                
                for (const [nRow, nCol] of neighbors) {
                    if (this.board[nRow][nCol] === -1) {
                        mineCount++;
                    }
                }
                
                this.board[row][col] = mineCount;
            }
        }
    }
    
    // Get all valid neighboring cells
    getNeighbors(row, col) {
        const neighbors = [];
        
        // Check all 8 surrounding positions
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                // Skip the center cell
                if (r === 0 && c === 0) continue;
                
                const newRow = row + r;
                const newCol = col + c;
                
                // Check if the position is within bounds
                if (newRow >= 0 && newRow < this.rows && 
                    newCol >= 0 && newCol < this.columns) {
                    neighbors.push([newRow, newCol]);
                }
            }
        }
        
        return neighbors;
    }
    
    // Start the game timer
    startTimer() {
        if (this.timerInterval) return;
        
        console.log("Starting timer");
        this.startTime = Date.now();
        this.elapsedTime = 0;
        
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            
            // Update the timer in the UI
            const timerElement = document.getElementById('timer');
            if (timerElement) {
                timerElement.textContent = this.formatTimerDisplay(this.elapsedTime);
            }
        }, 1000);
    }
    
    // Format timer display
    formatTimerDisplay(seconds) {
        return seconds.toString().padStart(3, '0');
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
        console.log(`Revealing cell at ${row},${col}`);
        
        // Do nothing if the game is over or the cell is already revealed or flagged
        if (this.gameState !== GAME_STATES.PLAYING && this.gameState !== GAME_STATES.NEW) {
            console.log(`Cannot reveal - game state is ${this.gameState}`);
            return false;
        }
        
        if (this.visible[row][col] === CELL_STATES.REVEALED || 
            this.visible[row][col] === CELL_STATES.FLAGGED) {
            console.log(`Cannot reveal - cell state is ${this.visible[row][col]}`);
            return false;
        }
        
        // Handle first click
        if (this.firstClick) {
            console.log("First click - setting up game");
            this.gameState = GAME_STATES.PLAYING;
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        // If the cell has a mine, game over
        if (this.board[row][col] === -1) {
            console.log("Game over - hit a mine!");
            this.loseGame(row, col);
            return true;
        }
        
        // Reveal the cell
        this.visible[row][col] = CELL_STATES.REVEALED;
        this.revealedCount++;
        
        // If the cell is empty (0), reveal all adjacent cells
        if (this.board[row][col] === 0) {
            this.floodFill(row, col);
        }
        
        // Check for win condition
        this.checkWinCondition();
        
        return true;
    }
    
    // Flood fill algorithm to reveal adjacent empty cells
    floodFill(row, col) {
        const neighbors = this.getNeighbors(row, col);
        
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
        console.log(`Toggling flag at ${row},${col}`);
        
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
            return true;
        }
        
        return false;
    }
    
    // Handle game win
    winGame() {
        console.log("Game won!");
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
        if (typeof playSound === 'function') {
            playSound('win');
        }
        
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
        if (typeof gameStorage !== 'undefined' && 
            typeof gameStorage.isHighScore === 'function' &&
            gameStorage.isHighScore(difficulty, this.elapsedTime)) {
            gameStorage.addHighScore(difficulty, this.elapsedTime);
        }
    }
    
    // Handle game loss
    loseGame(explodedRow, explodedCol) {
        console.log(`Game lost! Exploded mine at ${explodedRow},${explodedCol}`);
        this.gameState = GAME_STATES.LOST;
        this.stopTimer();
        
        // Store the exploded mine
        this.explodedMine = [explodedRow, explodedCol];
        
        // Reveal all mines
        for (const [row, col] of this.minePositions) {
            if (this.visible[row][col] !== CELL_STATES.FLAGGED) {
                this.visible[row][col] = CELL_STATES.REVEALED;
            }
        }
        
        // Identify incorrectly flagged cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                if (this.visible[row][col] === CELL_STATES.FLAGGED && this.board[row][col] !== -1) {
                    this.visible[row][col] = 'wrong-flag';
                }
            }
        }
        
        // Play explosion sound
        if (typeof playSound === 'function') {
            playSound('explosion');
        }
    }
    
    // Reset the game
    resetGame() {
        console.log("Resetting game");
        this.initializeBoard();
    }
    
    // Provide a hint by revealing a safe cell
    provideHint() {
        console.log("Providing hint");
        
        // Don't provide hints if the game is over
        if (this.gameState !== GAME_STATES.PLAYING && this.gameState !== GAME_STATES.NEW) {
            return null;
        }
        
        // If the game hasn't started yet, start it
        if (this.gameState === GAME_STATES.NEW) {
            // Place mines but don't exclude any cell
            this.gameState = GAME_STATES.PLAYING;
            this.placeMines(-1, -1);
            this.firstClick = false;
            this.startTimer();
        }
        
        // Create a list of hidden and unflagged cells that don't have mines
        const hiddenSafeCells = [];
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                if (this.visible[row][col] === CELL_STATES.HIDDEN && this.board[row][col] !== -1) {
                    hiddenSafeCells.push([row, col]);
                }
            }
        }
        
        // If there are no safe cells to reveal, return null
        if (hiddenSafeCells.length === 0) {
            return null;
        }
        
        // Pick a random safe cell
        const randomIndex = Math.floor(Math.random() * hiddenSafeCells.length);
        const [hintRow, hintCol] = hiddenSafeCells[randomIndex];
        
        // Play hint sound
        if (typeof playSound === 'function') {
            playSound('hint');
        }
        
        // Return the hint cell for UI handling
        return { row: hintRow, col: hintCol };
    }
    
    // Get the current state of the game as an object
    getGameState() {
        return {
            board: JSON.parse(JSON.stringify(this.board)), // Deep copy
            visible: JSON.parse(JSON.stringify(this.visible)), // Deep copy
            gameState: this.gameState,
            mineCount: this.mines,
            flagCount: this.flagCount,
            elapsedTime: this.elapsedTime,
            explodedMine: this.explodedMine
        };
    }
    
    // Update game settings
    updateSettings(rows, columns, mines) {
        console.log(`Updating settings: ${rows}×${columns}, ${mines} mines`);
        
        // Validate inputs
        if (typeof validateCustomSettings === 'function') {
            const validSettings = validateCustomSettings(columns, rows, mines);
            this.rows = validSettings.height;
            this.columns = validSettings.width;
            this.mines = validSettings.mines;
        } else {
            // Basic validation
            this.rows = Math.max(5, Math.min(rows, 40));
            this.columns = Math.max(5, Math.min(columns, 40));
            
            const maxMines = Math.floor((this.rows * this.columns) / 3);
            this.mines = Math.max(1, Math.min(mines, maxMines));
        }
        
        // Reinitialize with new settings
        this.initializeBoard();
    }
} 