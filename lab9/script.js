const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        const MAP_SIZE = {
          small: 300,
          medium: 400,
          large: 500
        };

        let selectedMapSize = 'medium';
        let GRID_SIZE = 20;
        let canvasSize = MAP_SIZE.large;
        
        let snake = [];
        let food = {};
        let direction = 'right';
        let nextDirection = 'right';
        let score = 0;
        let highScore = {
            classic: parseInt(localStorage.getItem('snakeHighScore_classic')) || 0,
            walls: parseInt(localStorage.getItem('snakeHighScore_walls')) || 0,
            portal: parseInt(localStorage.getItem('snakeHighScore_portal')) || 0,
            speed: parseInt(localStorage.getItem('snakeHighScore_speed')) || 0
        };
        let gameLoop;
        let isPaused = false;
        let startTime;
        let elapsedTime = 0;
        let timerInterval;
        let gameSpeed = 250;
        let isGameRunning = false;
        let selectedGameMode = 'classic';
        let timeLimit = Infinity;
        let challengeTimeLeft = 0;
        let foodType = 'normal';
        let walls = [];

        let specialFoods = []

        
        function updateHighScoreDisplay() {
            const currentHighScore = highScore[selectedGameMode] || 0;
            document.getElementById('highScore').textContent = currentHighScore;
        }

        function selectMapSize(size) {
          selectedMapSize = size;
          console.log("map size:", selectedMapSize);
          const options = document.querySelectorAll('.map-option');
          options.forEach(option => option.classList.remove('selected'));
          document.querySelector(`[data-size="${size}"]`).classList.add('selected')
        }

        function selectGameMode(mode) {
            selectedGameMode = mode;
            console.log("game mode:", selectedGameMode);
            const options = document.querySelectorAll('.mode-option');
            options.forEach(option => option.classList.remove('selected'));
            document.querySelector(`[data-mode="${mode}"]`).classList.add('selected')
        }

        function startGameFromMenu() {
          document.getElementById('menuScreen').classList.add('hidden');
          document.getElementById('header').classList.remove('hidden');
          document.getElementById('gameCanvas').classList.add('visible');
          document.getElementById('controls').classList.remove('hidden');
          document.getElementById('instructions').classList.remove('hidden');
            
          initGame();
          startGame();
        }

        function backToMenu() {
          if (gameLoop) clearInterval(gameLoop);
          if (timerInterval) clearInterval(timerInterval);

          isGameRunning = false;
          document.getElementById('menuScreen').classList.remove('hidden');
          document.getElementById('header').classList.add('hidden');
          document.getElementById('gameCanvas').classList.remove('visible');
          document.getElementById('controls').classList.add('hidden');
          document.getElementById('instructions').classList.add('hidden');
          document.getElementById('gameOver').classList.remove('show');
        }
        
        function initGame() {
            canvasSize = MAP_SIZE[selectedMapSize];
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            
            const center = Math.floor(canvasSize / GRID_SIZE / 2) * GRID_SIZE;
            snake = [
                {x: center, y: center},
                {x: center - GRID_SIZE, y: center},
                {x: center - GRID_SIZE * 2, y: center}
            ];
            
            direction = 'right';
            nextDirection = 'right';
            score = 0;
            isPaused = false;
            gameSpeed = 250;
            walls = []
            updateScore();
            updateHighScoreDisplay();
            generateFood();
            
            startTime = Date.now();
            elapsedTime = 0;
            applyGameMode();
            updateTimer();
            canvas.style.display = 'block';
            console.log("initgame complete. mode:", selectedGameMode, "walls", walls.length);
        }

        function applyGameMode() {
            timeLimit = Infinity;
            challengeTimeLeft = 0;

            switch(selectedGameMode) {
                case 'classic':
                    gameSpeed = 200;
                    break;
                case 'walls':
                    gameSpeed = 20;
                    generateWalls()
                    console.log("walls mode apply, walls count:", walls.length);
                    break;
                case 'portal':
                    gameSpeed = 200;
                    console.log("portal mode apply")
                    break;
                case 'speed':
                    gameSpeed = 150;
                    timeLimit = 120000;
                    challengeTimeLeft = timeLimit;
                    break;
            }
        }
        
        function startGame() {
            if (gameLoop) clearInterval(gameLoop);
            if (timerInterval) clearInterval(timerInterval);
            
            document.getElementById('gameOver').classList.remove('show');
            isGameRunning = true;
            
            gameLoop = setInterval(update, gameSpeed);
            timerInterval = setInterval(updateTimer, 100);
        }

        function restartGame() {
          document.getElementById('pauseButton').textContent = 'Pause'
          initGame();
          startGame();
        }
        
        function togglePause() {
          if (!isGameRunning) return;
            
          isPaused = !isPaused;
          const pauseButton = document.getElementById('pauseButton');
          if (isPaused) {
              clearInterval(gameLoop);
              clearInterval(timerInterval);
              pauseButton.textContent = 'Continue';
          } else {
              gameLoop = setInterval(update, gameSpeed);
              timerInterval = setInterval(updateTimer, 100);
              startTime = Date.now() - elapsedTime;
              pauseButton.textContent = 'Pause';
          }
        }
        
        function generateFood() {
            const maxPos = Math.floor(canvasSize / GRID_SIZE);
            food = {
                x: Math.floor(Math.random() * maxPos) * GRID_SIZE,
                y: Math.floor(Math.random() * maxPos) * GRID_SIZE,
                type: 'normal'
            };

            if (Math.random() < 0.1) {
                food.type = 'golden';
            }

            for (let segment of snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    generateFood();
                    return;
                }
            }
        }
        
        function update() {
            if (isPaused) return;
            
            direction = nextDirection;
            
            const head = {x: snake[0].x, y: snake[0].y};
            
            switch(direction) {
                case 'up': head.y -= GRID_SIZE; break;
                case 'down': head.y += GRID_SIZE; break;
                case 'left': head.x -= GRID_SIZE; break;
                case 'right': head.x += GRID_SIZE; break;
            }

            if (selectedGameMode === 'portal') {
                if (head.x < 0) head.x = canvasSize - GRID_SIZE;
                else if (head.x >= canvasSize) head.x = 0;

                if (head.y < 0) head.y = canvasSize - GRID_SIZE;
                else if (head.y >= canvasSize) head.y = 0;
            } else {
                if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
                gameOver();
                return;
            }

            }
            
            if (selectedGameMode === 'walls') {
                for (let wall of walls) {
                    if (head.x === wall.x && head.y === wall.y) {
                        gameOver();
                        return;
                    }
                }
            }
            
            for (let segment of snake) {
                if (head.x === segment.x && head.y === segment.y) {
                    gameOver();
                    return;
                }
            }
            
            snake.unshift(head);
            
            if (head.x === food.x && head.y === food.y) {
                if (food.type === 'golden') {
                    score += 5;
                } else {
                    score++;
                }

                updateScore();
                generateFood();

                if(score % 5 === 0 && gameSpeed > 50) {
                    gameSpeed -= 5;
                    clearInterval(gameLoop);
                    gameLoop = setInterval(update, gameSpeed);
                }

                if (selectGameMode === 'speed') {
                    timeLimit += 5000;
                }
            } else {
                snake.pop();
            }
            
            draw();
        }
        
        function draw() {
            const gradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
            gradient.addColorStop(0, '#0f2027');
            gradient.addColorStop(0.5, '#203a43');
            gradient.addColorStop(1, '#2c5364');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= canvasSize; i += GRID_SIZE) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvasSize);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvasSize, i);
                ctx.stroke();
            }

            if (selectedGameMode === 'walls') {
                walls.forEach(wall => {
                    ctx.fillStyle = '#666';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#333'
                    ctx.fillRect(wall.x + 2, wall.y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
                    ctx.shadowBlur = 0;
                });
            }
            
            if (food.type === 'normal') {
                ctx.fillStyle = '#ff6b6b';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(food.x + GRID_SIZE/2, food.y + GRID_SIZE/2, GRID_SIZE/2 - 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (food.type === 'golden') {
                const gradient = ctx.createLinearGradient (
                    food.x + GRID_SIZE/2, food.y + GRID_SIZE/2, 0,
                    food.x + GRID_SIZE/2, food.y + GRID_SIZE/2, GRID_SIZE/2 + 2
                );
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(0.7, '#FFA500');
                gradient.addColorStop(1, '#FF8C00');

                ctx.fillStyle = gradient;
                ctx.shadowBlur = 25;
                ctx.shadowColor = '#FFD700'
                ctx.beginPath();
                ctx.arc(food.x + GRID_SIZE/2, food.y + GRID_SIZE/2, GRID_SIZE/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            
            snake.forEach((segment, index) => {
                const gradient = ctx.createRadialGradient(
                    segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2, 2,
                    segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2, GRID_SIZE/2
                );
                
                if (index === 0) {
                    gradient.addColorStop(0, '#4ecdc4');
                    gradient.addColorStop(1, '#44a08d');
                } else {
                    gradient.addColorStop(0, '#95e1d3');
                    gradient.addColorStop(1, '#44a08d');
                }
                
                ctx.fillStyle = gradient;
                ctx.fillRect(segment.x + 1, segment.y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
                
                if (index === 0) {
                    ctx.fillStyle = 'white';
                    const eyeSize = 3;
                    if (direction === 'right') {
                        ctx.fillRect(segment.x + GRID_SIZE - 8, segment.y + 5, eyeSize, eyeSize);
                        ctx.fillRect(segment.x + GRID_SIZE - 8, segment.y + GRID_SIZE - 8, eyeSize, eyeSize);
                    } else if (direction === 'left') {
                        ctx.fillRect(segment.x + 5, segment.y + 5, eyeSize, eyeSize);
                        ctx.fillRect(segment.x + 5, segment.y + GRID_SIZE - 8, eyeSize, eyeSize);
                    } else if (direction === 'up') {
                        ctx.fillRect(segment.x + 5, segment.y + 5, eyeSize, eyeSize);
                        ctx.fillRect(segment.x + GRID_SIZE - 8, segment.y + 5, eyeSize, eyeSize);
                    } else {
                        ctx.fillRect(segment.x + 5, segment.y + GRID_SIZE - 8, eyeSize, eyeSize);
                        ctx.fillRect(segment.x + GRID_SIZE - 8, segment.y + GRID_SIZE - 8, eyeSize, eyeSize);
                    }
                }
            });
        }
        
        function updateScore() {
            document.getElementById('score').textContent = score;
            const currentHighScore = highScore[selectedGameMode] || 0;
            if (score > currentHighScore) {
                highScore[selectedGameMode] = score;
                localStorage.setItem(`snakeHighScore_${selectGameMode}`, score);
                document.getElementById('highScore').textContent = score;
                console.log(`New high score ${selectedGameMode}: ${score}`)
            }
        }
        
        function updateTimer() {
            if (!isPaused && startTime) {
                const currentElapsed = Date.now() - startTime;

                if (selectedGameMode === 'speed') {
                    challengeTimeLeft = timeLimit - currentElapsed;
                    if (challengeTimeLeft <= 0) {
                        challengeTimeLeft = 0;
                        gameOver();
                        return;
                    }

                    const second = Math.floor(challengeTimeLeft / 1000);
                    const minute = Math.floor(second / 60);
                    const displayTime = String(minute).padStart(2, '0') + ':' + String(second % 60).padStart(2, '0');
                    document.getElementById('timer').textContent = displayTime;
                } else {
                    elapsedTime = currentElapsed;
                    const second = Math.floor(elapsedTime / 1000);
                    const minute = Math.floor(second / 60);
                    const hour = Math.floor(minute / 60);
                    const displayTime = String(hour).padStart(2, '0') + ':' +String(minute % 60).padStart(2, '0') + ':' +String(second % 60).padStart(2, '0');
                    document.getElementById('timer').textContent = displayTime;
                }
            }
        }
        
        function gameOver() {
            clearInterval(gameLoop);
            clearInterval(timerInterval);
            isGameRunning = false;
            
            document.getElementById('finalScore').textContent = score;
            document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
            document.getElementById('gameOver').classList.add('show');
        }
        
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (direction !== 'down') nextDirection = 'up';
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (direction !== 'up') nextDirection = 'down';
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (direction !== 'right') nextDirection = 'left';
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (direction !== 'left') nextDirection = 'right';
                    e.preventDefault();
                    break;
                case ' ':
                    togglePause();
                    e.preventDefault();
                    break;
            }
        });
        
        let touchStartX = 0;
        let touchStartY = 0;
        
        canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        });
        
        canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0 && direction !== 'left') nextDirection = 'right';
                else if (dx < 0 && direction !== 'right') nextDirection = 'left';
            } else {
                if (dy > 0 && direction !== 'up') nextDirection = 'down';
                else if (dy < 0 && direction !== 'down') nextDirection = 'up';
            }
            e.preventDefault();
        });

        function generateWalls() {
            walls = [];
            if (selectedGameMode !== 'walls') return;

            const wallCount = Math.floor((canvasSize / GRID_SIZE) / 3);
            console.log("wall count:", wallCount);
            for (let i = 0; i < wallCount; i++) {
                const maxPos = Math.floor(canvasSize / GRID_SIZE);
                let wall = {
                    x: Math.floor(Math.random() * maxPos) * GRID_SIZE,
                    y: Math.floor(Math.random() * maxPos) * GRID_SIZE
                };

                let isValid = true;
                for (let segment of snake) {
                    if (segment.x === walls.x && segment.y === walls.y) {
                        isValid = false;
                        break;
                    }
                }

                if (food.x === walls.x && food.y === walls.y) {
                    isValid = false;
                }

                if (isValid) {
                    walls.push(wall);
                } else {
                    i--;
                }
            }

            console.log('Total walls generated:', walls.length);
            console.log('Walls:', walls);
        }
        