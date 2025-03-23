/**
 * UI handler for Minesweeper
 * Connects game logic to the user interface and handles user interactions
 */

// Main game instance
let game;

// DOM elements
const gameBoard = document.getElementById('game-board');
const minesCount = document.getElementById('mines-count');
const timer = document.getElementById('timer');
const difficultySelect = document.getElementById('difficulty');
const resetButton = document.getElementById('reset-button');
const gameEmoji = document.getElementById('game-emoji');
const hintButton = document.getElementById('hint-button');
const showHighScoresButton = document.getElementById('show-high-scores');
const customSettings = document.getElementById('custom-settings');
const customWidth = document.getElementById('custom-width');
const customHeight = document.getElementById('custom-height');
const customMines = document.getElementById('custom-mines');
const themeSwitch = document.getElementById('theme-switch');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.close');

// Initialize the game with saved settings or defaults
function initializeGame() {
    // Load the theme setting
    const savedTheme = gameStorage.getSetting('theme', 'light');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    }
    
    // Load the last difficulty setting
    const lastDifficulty = gameStorage.getSetting('last_difficulty', 'medium');
    difficultySelect.value = lastDifficulty;
    
    // Initialize the game with the selected difficulty
    setupGameByDifficulty(lastDifficulty);
    
    // Set up event listeners
    setupEventListeners();
}

// Set up game based on selected difficulty
function setupGameByDifficulty(difficulty) {
    console.log('Setting up game with difficulty:', difficulty);
    let rows, columns, mines;
    
    if (difficulty === 'custom') {
        // Show custom settings
        customSettings.classList.add('active');
        
        // Get custom settings
        rows = parseInt(customHeight.value);
        columns = parseInt(customWidth.value);
        mines = parseInt(customMines.value);
    } else {
        // Hide custom settings
        customSettings.classList.remove('active');
        
        // Get preset difficulty settings
        const settings = DIFFICULTY_LEVELS[difficulty];
        rows = settings.rows;
        columns = settings.columns;
        mines = settings.mines;
    }
    
    console.log('Creating game with:', rows, 'rows,', columns, 'columns,', mines, 'mines');
    
    // Create a new game instance
    game = new MinesweeperGame(rows, columns, mines);
    
    // Update the CSS variable for the number of columns
    document.documentElement.style.setProperty('--columns', columns);
    console.log('Set CSS variable --columns to', columns);
    
    // Force the game board to update its grid template
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    // Update the mines counter
    updateMinesCounter();
    
    // Reset the timer display
    timer.textContent = '000';
    
    // Render the game board
    renderBoard();
    
    // Save the selected difficulty
    gameStorage.setSetting('last_difficulty', difficulty);
}

// Set up all event listeners
function setupEventListeners() {
    // Difficulty selector change event
    difficultySelect.addEventListener('change', () => {
        const selectedDifficulty = difficultySelect.value;
        setupGameByDifficulty(selectedDifficulty);
    });
    
    // Reset button click event
    resetButton.addEventListener('click', () => {
        game.resetGame();
        updateGameDisplay();
    });
    
    // Hint button click event
    hintButton.addEventListener('click', () => {
        // First click should be a hint if the game hasn't started
        if (game.gameState === GAME_STATES.NEW) {
            game.gameState = GAME_STATES.PLAYING;
            game.placeMines(-1, -1); // Place mines but don't exclude any cell
            game.firstClick = false;
            game.startTimer();
        }
        
        const hint = game.provideHint();
        if (hint) {
            // Reveal the hint cell
            game.revealCell(hint.row, hint.col);
            updateGameDisplay();
            
            // Highlight the cell temporarily
            const cellElement = document.querySelector(`[data-row="${hint.row}"][data-col="${hint.col}"]`);
            if (cellElement) {
                cellElement.classList.add('hint-highlight');
                setTimeout(() => {
                    cellElement.classList.remove('hint-highlight');
                }, 1500);
            }
        }
    });
    
    // Show high scores button click event
    showHighScoresButton.addEventListener('click', showHighScores);
    
    // Modal close button click event
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Click outside modal to close
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Custom settings input events
    customWidth.addEventListener('input', validateCustomInputs);
    customHeight.addEventListener('input', validateCustomInputs);
    customMines.addEventListener('input', validateCustomInputs);
    
    // Theme toggle event
    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            document.body.setAttribute('data-theme', 'dark');
            gameStorage.setSetting('theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            gameStorage.setSetting('theme', 'light');
        }
    });
}

// Validate and update custom game settings
function validateCustomInputs() {
    // Get the current values
    const width = parseInt(customWidth.value) || 10;
    const height = parseInt(customHeight.value) || 10;
    const mines = parseInt(customMines.value) || 10;
    
    // Validate with utility function
    const validSettings = validateCustomSettings(width, height, mines);
    
    // Update the input fields with valid values
    customWidth.value = validSettings.width;
    customHeight.value = validSettings.height;
    customMines.value = validSettings.mines;
    
    // If the current game is custom, update it
    if (difficultySelect.value === 'custom') {
        game.updateSettings(validSettings.height, validSettings.width, validSettings.mines);
        document.documentElement.style.setProperty('--columns', validSettings.width);
        updateGameDisplay();
    }
}

// Show high scores modal
function showHighScores() {
    modalTitle.textContent = 'High Scores';
    
    // Get high scores for each difficulty
    const highScores = gameStorage.getHighScores();
    
    // Get elements for each difficulty list
    const easyScoresList = document.getElementById('easy-scores');
    const mediumScoresList = document.getElementById('medium-scores');
    const hardScoresList = document.getElementById('hard-scores');
    
    // Clear existing scores
    easyScoresList.innerHTML = '';
    mediumScoresList.innerHTML = '';
    hardScoresList.innerHTML = '';
    
    // Populate Easy scores
    if (highScores.easy.length === 0) {
        easyScoresList.innerHTML = '<li>No scores yet</li>';
    } else {
        highScores.easy.forEach((score, index) => {
            const scoreDate = new Date(score.date);
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${score.formatted} - ${formatDate(scoreDate)}`;
            easyScoresList.appendChild(li);
        });
    }
    
    // Populate Medium scores
    if (highScores.medium.length === 0) {
        mediumScoresList.innerHTML = '<li>No scores yet</li>';
    } else {
        highScores.medium.forEach((score, index) => {
            const scoreDate = new Date(score.date);
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${score.formatted} - ${formatDate(scoreDate)}`;
            mediumScoresList.appendChild(li);
        });
    }
    
    // Populate Hard scores
    if (highScores.hard.length === 0) {
        hardScoresList.innerHTML = '<li>No scores yet</li>';
    } else {
        highScores.hard.forEach((score, index) => {
            const scoreDate = new Date(score.date);
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${score.formatted} - ${formatDate(scoreDate)}`;
            hardScoresList.appendChild(li);
        });
    }
    
    // Show the modal
    modal.style.display = 'block';
}

// Render the game board
function renderBoard() {
    console.log('Rendering game board with rows:', game.rows, 'columns:', game.columns);
    
    // Clear existing board
    gameBoard.innerHTML = '';
    
    // Add a debug element to check if the board container is visible
    const debugMsg = document.createElement('div');
    debugMsg.textContent = `Board: ${game.rows}x${game.columns} with ${game.mines} mines`;
    debugMsg.style.gridColumn = '1 / -1';
    debugMsg.style.textAlign = 'center';
    debugMsg.style.padding = '5px';
    debugMsg.style.backgroundColor = '#f0f0f0';
    gameBoard.appendChild(debugMsg);
    
    // Make sure the game board container has dimensions
    gameBoard.style.display = 'grid';
    gameBoard.style.gridTemplateColumns = `repeat(${game.columns}, 1fr)`;
    gameBoard.style.width = 'fit-content';
    gameBoard.style.margin = '0 auto';
    
    // Force some minimum dimensions
    const minCellSize = '30px';
    gameBoard.style.minWidth = `calc(${minCellSize} * ${game.columns})`;
    gameBoard.style.minHeight = `calc(${minCellSize} * ${game.rows})`;
    
    // Generate cells
    for (let row = 0; row < game.rows; row++) {
        for (let col = 0; col < game.columns; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.setAttribute('data-row', row);
            cell.setAttribute('data-col', col);
            
            // Debug info in each cell
            if (row === 0 && col === 0) {
                cell.setAttribute('title', `Cell 0,0`);
                cell.style.border = '2px solid red';
            }
            
            // Set up cell click and right-click events
            cell.addEventListener('click', () => {
                handleCellClick(row, col);
            });
            
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleCellRightClick(row, col);
            });
            
            gameBoard.appendChild(cell);
        }
    }
    
    // Log the number of cells created
    console.log('Created', gameBoard.children.length - 1, 'cells plus debug message');
    
    // Update the game display
    updateGameDisplay();
    
    // Log board dimensions for debugging
    console.log('Board dimensions:', gameBoard.offsetWidth, 'x', gameBoard.offsetHeight);
    console.log('First cell dimensions:', gameBoard.children[1]?.offsetWidth, 'x', gameBoard.children[1]?.offsetHeight);
}

// Handle left-click on a cell
function handleCellClick(row, col) {
    if (game.revealCell(row, col)) {
        playSound('click');
        updateGameDisplay();
    }
}

// Handle right-click on a cell
function handleCellRightClick(row, col) {
    if (game.toggleFlag(row, col)) {
        playSound('flag');
        updateGameDisplay();
    }
}

// Update the game display based on current game state
function updateGameDisplay() {
    const gameState = game.getGameState();
    
    // Update the mines counter
    updateMinesCounter();
    
    // Update cells display
    for (let row = 0; row < game.rows; row++) {
        for (let col = 0; col < game.columns; col++) {
            const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!cellElement) continue;
            
            // Remove existing state classes
            cellElement.className = 'cell';
            
            // Add classes based on cell state
            const cellState = gameState.visible[row][col];
            const cellValue = gameState.board[row][col];
            
            if (cellState === CELL_STATES.REVEALED) {
                cellElement.classList.add('revealed');
                
                if (cellValue === -1) {
                    cellElement.classList.add('mine');
                    
                    // Mark the exploded mine
                    if (gameState.explodedMine && gameState.explodedMine[0] === row && gameState.explodedMine[1] === col) {
                        cellElement.classList.add('exploded');
                    }
                } else if (cellValue > 0) {
                    cellElement.classList.add(`number-${cellValue}`);
                    cellElement.textContent = cellValue;
                }
            } else if (cellState === CELL_STATES.FLAGGED) {
                cellElement.classList.add('flagged');
            } else if (cellState === CELL_STATES.QUESTION) {
                cellElement.classList.add('question');
            } else if (cellState === 'wrong-flag') {
                cellElement.classList.add('wrong-flag');
            }
        }
    }
    
    // Update the emoji based on game state
    if (gameState.gameState === GAME_STATES.PLAYING || gameState.gameState === GAME_STATES.NEW) {
        gameEmoji.textContent = '😀';
    } else if (gameState.gameState === GAME_STATES.WON) {
        gameEmoji.textContent = '😎';
    } else if (gameState.gameState === GAME_STATES.LOST) {
        gameEmoji.textContent = '😵';
    }
}

// Update the mines counter display
function updateMinesCounter() {
    const gameState = game.getGameState();
    const remainingMines = gameState.mineCount - gameState.flagCount;
    minesCount.textContent = remainingMines;
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing game');
    
    // Make sure the game board element exists
    if (!gameBoard) {
        console.error('Game board element not found!');
        return;
    }
    
    // Initialize the game
    initializeGame();
    
    // Force a re-render of the board
    setTimeout(() => {
        console.log('Forcing board render');
        if (game) {
            renderBoard();
        }
    }, 100);
});

// Optional: Create a folder for assets and sound files
(function setupAssets() {
    try {
        // Create assets directory if it doesn't exist
        // This is just a placeholder - for a real project, you would include these files in your repo
        console.log('Note: You would need to add sound files to an assets/sounds directory for the sound effects to work.');
    } catch (error) {
        console.log('This is just a note about assets, not an actual error.');
    }
})(); 