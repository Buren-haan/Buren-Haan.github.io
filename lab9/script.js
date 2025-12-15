const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        const MAP_SIZE = {
          small: 400,
          medium: 500,
          large: 600
        };

        let selectedMapSize = 'medium';
        let GRID_SIZE = 20;
        let canvasSize = MAP_SIZE.medium;
        
        let snake = [];
        let food = {};
        let direction = 'right';
        let nextDirection = 'right';
        let score = 0;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        let gameLoop;
        let isPaused = false;
        let startTime;
        let elapsedTime = 0;
        let timerInterval;
        let gameSpeed = 200;
        let isGameRunning = false;
        
        document.getElementById('highScore').textContent = highScore;

        function selectMapSize(size) {
          selectedMapSize = size;
          const options = document.querySelectorAll('.map-option');
          options.forEach(option => option.classList.remove('selected'));
          event.currentTarget.classList.add('selected');
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
            gameSpeed = 200;
            updateScore();
            generateFood();
            
            startTime = Date.now();
            elapsedTime = 0;
            updateTimer();
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
                y: Math.floor(Math.random() * maxPos) * GRID_SIZE
            };
            
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
            
            if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
                gameOver();
                return;
            }
            
            for (let segment of snake) {
                if (head.x === segment.x && head.y === segment.y) {
                    gameOver();
                    return;
                }
            }
            
            snake.unshift(head);
            
            if (head.x === food.x && head.y === food.y) {
                score++;
                updateScore();
                generateFood();
                
                if (score % 3 === 0 && gameSpeed > 50) {
                    gameSpeed -= 5;
                    clearInterval(gameLoop);
                    gameLoop = setInterval(update, gameSpeed);
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
            
            ctx.fillStyle = '#ff6b6b';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(food.x + GRID_SIZE/2, food.y + GRID_SIZE/2, GRID_SIZE/2 - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
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
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('snakeHighScore', highScore);
                document.getElementById('highScore').textContent = highScore;
            }
        }
        
        function updateTimer() {
            if (!isPaused && startTime) {
                elapsedTime = Date.now() - startTime;
                const seconds = Math.floor(elapsedTime / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                
                const displayTime = 
                    String(hours).padStart(2, '0') + ':' +
                    String(minutes % 60).padStart(2, '0') + ':' +
                    String(seconds % 60).padStart(2, '0');
                
                document.getElementById('timer').textContent = displayTime;
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
        
        startGame();