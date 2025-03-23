/**
 * Local storage handling for Minesweeper game
 * Manages high scores and game settings persistence
 */

class GameStorage {
    constructor() {
        this.highScoresKey = 'minesweeper_high_scores';
        this.settingsKey = 'minesweeper_settings';
        this.initStorage();
    }

    // Initialize local storage with default values if not exists
    initStorage() {
        // Check and initialize high scores
        if (!localStorage.getItem(this.highScoresKey)) {
            const defaultHighScores = {
                easy: [],
                medium: [],
                hard: [],
                custom: []
            };
            localStorage.setItem(this.highScoresKey, JSON.stringify(defaultHighScores));
        }

        // Check and initialize settings
        if (!localStorage.getItem(this.settingsKey)) {
            const defaultSettings = {
                sounds_enabled: true,
                theme: 'light',
                last_difficulty: 'medium'
            };
            localStorage.setItem(this.settingsKey, JSON.stringify(defaultSettings));
        }
    }

    // Get all high scores
    getHighScores() {
        try {
            return JSON.parse(localStorage.getItem(this.highScoresKey));
        } catch (e) {
            console.error('Error retrieving high scores from local storage:', e);
            return {
                easy: [],
                medium: [],
                hard: [],
                custom: []
            };
        }
    }

    // Get high scores for a specific difficulty
    getHighScoresByDifficulty(difficulty) {
        const allScores = this.getHighScores();
        return allScores[difficulty] || [];
    }

    // Add a new high score
    addHighScore(difficulty, time, date = new Date()) {
        try {
            const allScores = this.getHighScores();
            
            // Custom difficulty scores are stored separately
            const difficultyKey = difficulty === 'custom' ? 'custom' : difficulty;
            
            if (!allScores[difficultyKey]) {
                allScores[difficultyKey] = [];
            }
            
            // Add the new score
            allScores[difficultyKey].push({
                time,
                date: date.toISOString(),
                formatted: formatTime(time)
            });
            
            // Sort scores (lowest time first) and keep only top 10
            allScores[difficultyKey].sort((a, b) => a.time - b.time);
            allScores[difficultyKey] = allScores[difficultyKey].slice(0, 10);
            
            // Save back to localStorage
            localStorage.setItem(this.highScoresKey, JSON.stringify(allScores));
            
            // Return true if this score made it to top 10
            return allScores[difficultyKey].some(score => score.time === time);
        } catch (e) {
            console.error('Error adding high score to local storage:', e);
            return false;
        }
    }

    // Check if a time would be a high score for the given difficulty
    isHighScore(difficulty, time) {
        const scores = this.getHighScoresByDifficulty(difficulty);
        
        // If we have less than 10 scores, it's automatically a high score
        if (scores.length < 10) {
            return true;
        }
        
        // Otherwise, check if this time beats the worst high score
        return time < scores[scores.length - 1].time;
    }

    // Get a setting value
    getSetting(key, defaultValue = null) {
        try {
            const settings = JSON.parse(localStorage.getItem(this.settingsKey));
            return settings[key] !== undefined ? settings[key] : defaultValue;
        } catch (e) {
            console.error('Error retrieving setting from local storage:', e);
            return defaultValue;
        }
    }

    // Update a setting
    setSetting(key, value) {
        try {
            const settings = JSON.parse(localStorage.getItem(this.settingsKey));
            settings[key] = value;
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Error updating setting in local storage:', e);
            return false;
        }
    }

    // Clear all high scores (for testing purposes)
    clearHighScores() {
        const defaultHighScores = {
            easy: [],
            medium: [],
            hard: [],
            custom: []
        };
        localStorage.setItem(this.highScoresKey, JSON.stringify(defaultHighScores));
    }
}

// Create global storage instance
const gameStorage = new GameStorage(); 