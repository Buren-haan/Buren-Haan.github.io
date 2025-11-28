 var questions = [
            'Biggest Mammal?',
            'Fastest vehicle?',
            'Capital of Mongolia?',
            'Longest river in the world?',
            'Largest planet in solar system?',
            'Smallest country in the world?',
            'Tallest mountain?',
            'Fastest land animal?'
        ];
        
        var answers = [
            'Whale',
            'Jet',
            'Ulaanbaatar',
            'Nile',
            'Jupiter',
            'Vatican',
            'Everest',
            'Cheetah'
        ];

        let currentQuestion = '';
        let currentAnswer = '';
        let guessedLetters = [];
        let wrongGuesses = 0;
        let maxWrong = 6;
        let gameActive = false;

        const canvas = document.getElementById('hangmanCanvas');
        const ctx = canvas.getContext('2d');

        function createKeyboard() {
            const keyboard = document.getElementById('keyboard');
            keyboard.innerHTML = '';
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            
            for (let letter of letters) {
                const key = document.createElement('button');
                key.className = 'key';
                key.textContent = letter;
                key.onclick = () => guessLetter(letter);
                keyboard.appendChild(key);
            }
        }

        function startGame() {
            const randomIndex = Math.floor(Math.random() * questions.length);
            currentQuestion = questions[randomIndex];
            currentAnswer = answers[randomIndex].toUpperCase();
            
            guessedLetters = [];
            wrongGuesses = 0;
            gameActive = true;

            document.getElementById('question').textContent = currentQuestion;
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('resetBtn').style.display = 'inline-block';
            document.getElementById('message').className = 'message';
            document.getElementById('message').style.display = 'none';

            createKeyboard();
            updateDisplay();
            updateStats();
            drawHangman();
        }

        function guessLetter(letter) {
            if (!gameActive || guessedLetters.includes(letter)) return;

            guessedLetters.push(letter);

            const keys = document.querySelectorAll('.key');
            keys.forEach(key => {
                if (key.textContent === letter) {
                    key.disabled = true;
                }
            });

            if (currentAnswer.includes(letter)) {
                updateDisplay();
                updateStats();
                checkWin();
            } else {
                wrongGuesses++;
                updateStats();
                drawHangman();
                checkLose();
            }
        }

        function updateDisplay() {
            let display = '';
            for (let letter of currentAnswer) {
                if (letter === ' ') {
                    display += '  ';
                } else if (guessedLetters.includes(letter)) {
                    display += letter + ' ';
                } else {
                    display += '_ ';
                }
            }
            document.getElementById('answerDisplay').textContent = display;
        }

        function updateStats() {
            document.getElementById('wrongGuesses').textContent = wrongGuesses + ' / ' + maxWrong;
            const correctCount = guessedLetters.filter(letter => currentAnswer.includes(letter)).length;
            document.getElementById('correctGuesses').textContent = correctCount;
        }

        function drawHangman() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;

            if (wrongGuesses >= 0) {
                ctx.beginPath();
                ctx.moveTo(20, 280);
                ctx.lineTo(180, 280);
                ctx.stroke();
            }

            if (wrongGuesses >= 1) {
                ctx.beginPath();
                ctx.moveTo(60, 280);
                ctx.lineTo(60, 20);
                ctx.stroke();
            }

            if (wrongGuesses >= 2) {
                ctx.beginPath();
                ctx.moveTo(60, 20);
                ctx.lineTo(150, 20);
                ctx.stroke();
            }

            if (wrongGuesses >= 3) {
                ctx.beginPath();
                ctx.moveTo(150, 20);
                ctx.lineTo(150, 50);
                ctx.stroke();
            }

            if (wrongGuesses >= 4) {
                ctx.beginPath();
                ctx.arc(150, 70, 20, 0, Math.PI * 2);
                ctx.stroke();
            }

            if (wrongGuesses >= 5) {
                ctx.beginPath();
                ctx.moveTo(150, 90);
                ctx.lineTo(150, 180);
                ctx.stroke();
            }

            if (wrongGuesses >= 6) {
                ctx.beginPath();
                ctx.moveTo(150, 110);
                ctx.lineTo(120, 150);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(150, 110);
                ctx.lineTo(180, 150);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(150, 180);
                ctx.lineTo(120, 240);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(150, 180);
                ctx.lineTo(180, 240);
                ctx.stroke();
            }
        }

        function checkWin() {
            let allGuessed = true;
            for (let letter of currentAnswer) {
                if (letter !== ' ' && !guessedLetters.includes(letter)) {
                    allGuessed = false;
                    break;
                }
            }

            if (allGuessed) {
                gameActive = false;
                const message = document.getElementById('message');
                message.className = 'message win';
                message.textContent = 'Та яллаа! Хариулт: ' + currentAnswer;
                disableAllKeys();
            }
        }

        function checkLose() {
            if (wrongGuesses >= maxWrong) {
                gameActive = false;
                const message = document.getElementById('message');
                message.className = 'message lose';
                message.textContent = 'Та ялагдлаа. Зөв хариулт: ' + currentAnswer;
                disableAllKeys();
            }
        }

        function disableAllKeys() {
            const keys = document.querySelectorAll('.key');
            keys.forEach(key => key.disabled = true);
        }

        function resetGame() {
            startGame();
        }

        drawHangman();
        createKeyboard();
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => key.disabled = true);