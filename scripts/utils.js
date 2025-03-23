/**
 * Utility functions for the Minesweeper game
 */

// Constants for game difficulty levels
const DIFFICULTY_LEVELS = {
    easy: {
        rows: 8,
        columns: 8,
        mines: 10,
        name: 'Easy'
    },
    medium: {
        rows: 16,
        columns: 16,
        mines: 40,
        name: 'Medium'
    },
    hard: {
        rows: 24,
        columns: 24,
        mines: 99,
        name: 'Hard'
    }
};

// Game states
const GAME_STATES = {
    NEW: 'new',
    PLAYING: 'playing',
    WON: 'won',
    LOST: 'lost'
};

// Cell states
const CELL_STATES = {
    HIDDEN: 'hidden',
    REVEALED: 'revealed',
    FLAGGED: 'flagged',
    QUESTION: 'question'
};

// Formats time in seconds to MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Formats time for the timer display (000 format)
function formatTimerDisplay(seconds) {
    return seconds.toString().padStart(3, '0');
}

// Get random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get all valid neighbors for a cell
function getNeighbors(row, col, rows, columns) {
    const neighbors = [];
    
    // All possible neighbor positions
    const positions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [rowOffset, colOffset] of positions) {
        const newRow = row + rowOffset;
        const newCol = col + colOffset;
        
        // Check if the new position is within the grid bounds
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < columns) {
            neighbors.push([newRow, newCol]);
        }
    }
    
    return neighbors;
}

// Create a deep copy of a 2D array
function deepCopyGrid(grid) {
    return grid.map(row => [...row]);
}

// Play a sound effect
function playSound(soundName) {
    // Check if sounds are enabled in settings
    const soundsEnabled = localStorage.getItem('minesweeper_sounds_enabled');
    if (soundsEnabled === 'false') return;
    
    const sounds = {
        click: 'click.mp3',
        flag: 'flag.mp3',
        explosion: 'explosion.mp3',
        win: 'win.mp3',
        hint: 'hint.mp3'
    };
    
    // If we have the sound available, play it
    if (sounds[soundName]) {
        try {
            // Use the asset path helper if available, otherwise use the default path
            let audioPath = 'assets/sounds/' + sounds[soundName];
            if (window.getAssetPath) {
                audioPath = window.getAssetPath('assets/sounds/' + sounds[soundName]);
            }
            
            console.log('Playing sound:', audioPath);
            const audio = new Audio(audioPath);
            audio.volume = 0.5;
            audio.play().catch(error => {
                // Silently fail if audio fails to play
                console.log('Sound could not be played:', error);
            });
        } catch (error) {
            // Silently fail if audio initialization fails
            console.log('Sound initialization failed:', error);
        }
    }
}

// Toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Format date for high scores
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Validate custom game settings to ensure they are within reasonable bounds
function validateCustomSettings(width, height, mines) {
    let validWidth = Math.min(Math.max(5, width), 40);
    let validHeight = Math.min(Math.max(5, height), 40);
    
    // Calculate maximum number of mines (cells / 3 is a reasonable upper limit)
    const maxMines = Math.floor((validWidth * validHeight) / 3);
    // Ensure at least 1 mine and at most maxMines
    let validMines = Math.min(Math.max(1, mines), maxMines);
    
    return {
        width: validWidth,
        height: validHeight,
        mines: validMines
    };
} 