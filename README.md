# Cyberscape

Cyberscape is a grid-based survival and strategy game built with HTML5 Canvas and JavaScript.  
The player must collect keys, acquire shrads, and deliver them to the base station in order to restore the **AUREX system** before it collapses.  
Meanwhile, rotating surveillance towers and decaying system health create constant tension.

## Gameplay

- Use the **arrow keys** (`↑ ↓ ← →`) to move your player around the map
- Collect keys (pink circles). Every **3 keys** allows the player to pick up one **shrad**(💠) from the central hub
- Deliver shrads to the **base station** (blue circle) to restore the constantly decreasing **system health**
- If system health hits 0, the system collapses and the game ends
- **Surveillance towers** (red cones) damage the player and the game ends if player health hits 0
- Click anywhere on the browser to shoot **bullets** in that direction. Bullets can destroy **buildings** (black blocks) and surveillance towers on 3 continuous hits. Bullets bounce off obstacles realistically
- Score updates based on the number of shrads delivered

**Win condition**: Restore system health to 100
**Lose condition**: Player health or system health reaches 0

## Features

- Procedural placement of base, hub, shrads, keys, towers, and buildings  
- Local high-score tracking using localStorage 
- Destructible buildings and interactive towers  
- Smooth animations with `requestAnimationFrame`  
- Pause/Resume functionality  

## Getting Started

1. Clone or download this repository.  
2. Open `index.html` in any modern browser.  
3. Start playing!  

## Tech Stack

- HTML5 (Canvas API)  
- CSS3
- Vanilla JavaScript
