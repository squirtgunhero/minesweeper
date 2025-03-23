# Minesweeper Game

A modern implementation of the classic Minesweeper game written in HTML, CSS, and JavaScript.

 Features

- Clean, responsive design that works on desktop and mobile devices
- Multiple difficulty levels (Easy, Medium, Hard, Custom)
- Game state tracking with emoji feedback (😀 for playing, 😎 for win, 😵 for loss)
- Mine counter and timer
- First-click protection (first click is never a mine)
- Flood-fill revealing of empty cells
- Flag placement with right-click
- High score tracking with local storage
- Dark/light theme toggle
- Hint system

 How to Play

1. Left Click: Reveal a cell
2. Right Click: Place/remove a flag or question mark
3. Difficulty Selection: Choose between Easy (8x8, 10 mines), Medium (16x16, 40 mines), or Hard (24x24, 99 mines)
4. Custom Settings: Create your own board size and mine count
5. Reset Button: Start a new game at any time
6. Hint Button: Reveals a safe cell if you're stuck

 Game Rules

- The objective is to reveal all cells that do not contain mines
- Numbers indicate how many mines are adjacent to that cell
- Use flags to mark cells you believe contain mines
- The game is won when all safe cells are revealed
- The game is lost if you reveal a cell containing a mine

 Technical Details

The game is built using modern vanilla JavaScript with a modular architecture:

- `index.html`: Main HTML structure
- `styles/style.css`: CSS styling with responsive design and theme support
- `scripts/utils.js`: Utility functions and constants
- `scripts/storage.js`: Local storage handling for high scores and settings
- `scripts/game.js`: Core game logic and mechanics
- `scripts/ui.js`: UI handling and user interactions

 Installation and Running

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. No build process or dependencies required

 Browser Compatibility

The game works in all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

 License

This project is open source and available under the MIT License. 