# Minesweeper Game

A classic Minesweeper game built with HTML, CSS, and vanilla JavaScript.

## Demo

You can play the game here: [Minesweeper Game](https://yourusername.github.io/minesweeper/)

## Game Features

- Three difficulty levels: Easy, Medium, and Hard
- Custom game settings
- Timer and mines counter
- High scores tracking
- Dark/Light theme toggle
- Hint system

## Files

The project contains the following key files:

- `index.html` - Main game HTML with CSS styles inline
- `minesweeper-standalone.html` - A standalone version with everything in one file (no external dependencies)
- `test.html` - A simple test page to verify board rendering
- `index-debug.html` - A debug version for troubleshooting
- `scripts/` - Directory containing game logic files
- `assets/sounds/` - Directory for sound effect files
- `.nojekyll` - File to prevent GitHub Pages from using Jekyll processing

## Getting It Working on GitHub Pages

Follow these steps to get the game working correctly on GitHub Pages:

1. **Fix the repo structure**

   Make sure you don't have nested git repositories. Check for a `.git` folder in any subdirectories and remove them if found.

   ```
   find . -name ".git" -type d -not -path "./.git" | xargs rm -rf
   ```

2. **Create empty sound files**

   Make sure you have the necessary sound files (even if empty) to prevent errors:

   ```
   mkdir -p assets/sounds
   touch assets/sounds/click.mp3 assets/sounds/flag.mp3 assets/sounds/explosion.mp3 assets/sounds/win.mp3 assets/sounds/hint.mp3
   ```

3. **Add the .nojekyll file**

   This prevents GitHub Pages from processing your site with Jekyll:

   ```
   touch .nojekyll
   ```

4. **Use the standalone version if needed**

   If you continue to have issues with the multi-file version, use the standalone version:

   ```
   cp minesweeper-standalone.html index.html
   ```

5. **Push to GitHub**

   Initialize a git repository and push to GitHub:

   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/minesweeper.git
   git push -u origin main
   ```

6. **Enable GitHub Pages**

   - Go to your repository on GitHub
   - Go to Settings > Pages
   - Set the Source to the "main" branch
   - Click Save
   - Wait a few minutes for deployment

## Troubleshooting

If the game isn't working on GitHub Pages, try these steps:

1. **Check the browser console** for any JavaScript errors.

2. **Test with the `test.html` or `minesweeper-standalone.html` file** to see if a simpler version works.

3. **Verify paths are correct** - GitHub Pages uses the repository name as part of the path, which can cause issues with asset loading.

4. **Check asset loading** - Open the Network tab in browser dev tools to see if any resources are failing to load.

5. **Try in different browsers** - Some CSS features might work differently across browsers.

6. **Use the debug version** - Open `index-debug.html` to see detailed logs about what's happening.

## Development

To work on this project locally:

1. Clone the repository
2. Open `index.html` in your browser
3. Make changes and refresh to see them

No build system or external dependencies are required. It's all vanilla HTML, CSS, and JavaScript.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 