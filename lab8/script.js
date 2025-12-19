 var questions = [
    'Хамгийн том хөхтөн амьтан?',
    'Монгол улсын нийслэл?',
    'Дэлхийн хамгийн урт мөрөн?',
    'Нарны аймгийн хамгийн том гариг?',
    'Дэлхийн хамгийн жижиг улс?',
    'Хамгийн өндөр уул?',
    'Хамгийн том далай?',
    'Шөнийн тэнгэрт хамгийн тод од?',
    'Хамгийн их хүн амтай улс?',
    'Дэлхийн хамгийн том цөл?',
    'Улаан гариг гэж нэрлэгддэг гариг?',
    'Харри Поттер номын зохиогч?',
    'Хамгийн том хуурай газрын амьтан?',
    'Японы мөнгөн тэмдэгт?',
    'Тивийн тоо хэд вэ?',
    'Гутал шиг хэлбэртэй улс?',
    'Дэлхийн хамгийн том шувуу?',
    'Маргад эрдэнийн өнгө?',
    'Гуакамолегийн үндсэн орц?',
    'Хамгийн том баавгайн төрөл?',
    'Франц улсын нийслэл?',
    'Хүний биеийн хамгийн урт яс?',
    'Бөгжтэй гэдгээрээ алдартай гариг?',
    'Дэлхийн хамгийн том арал?',
    'Үелэх системийн эхний элемент?',
    'Хамгийн урт хүзүүтэй амьтан?',
    'Мандах нарны орон гэж аль улсыг хэлдэг вэ?',
    'Хүний биеийн хамгийн том эрхтэн?',
    'Их Британийн мөнгөн тэмдэгт?',
    'Ромео ба Жульетта зохиолын зохиогч?',
    'Хамгийн том муурын төрөл?',
    'Хамгийн хурдан шувуу?',
    'Хамгийн олон пирамидтай улс?',
    'Хамгийн том могойн төрөл?',
    'Бадмаараг эрдэнийн өнгө?',
    'Бразилын албан ёсны хэл?',
    'Хамгийн том далайн гахайн төрөл?',
    'Египет улсын нийслэл?',
    'Эртний дэлхийн гайхамшгийн тоо хэд вэ?',
    'Цахилгааныг зохион бүтээгч?'
];

var answers = [
    'Халим',
    'Улаанбаатар',
    'Нил мөрөн',
    'Бархасбадь',
    'Ватикан',
    'Эверест',
    'Номхон далай',
    'Сириус',
    'Хятад',
    'Сахарын цөл',
    'Ангараг',
    'Роулинг',
    'Заан',
    'Иен',
    'Долоо',
    'Итали',
    'Тэмээн хяруул',
    'Ногоон',
    'Авокадо',
    'Цагаан баавгай',
    'Парис',
    'Гуяны яс',
    'Санчир',
    'Гренланд',
    'Устөрөгч',
    'Анааш',
    'Япон',
    'Арьс',
    'Фунт',
    'Шекспир',
    'Бар',
    'Шонхор',
    'Египет',
    'Анаконда',
    'Улаан',
    'Португал хэл',
    'Орка',
    'Каир',
    'Долоо',
    'Эдисон'
];
''
        let currentQuestion = '';
        let currentAnswer = '';
        let guessedLetters = [];
        let wrongGuesses = 0;
        let maxWrong = 7;
        let gameActive = false;
        let currentPosition = 0;

        const canvas = document.getElementById('hangmanCanvas');
        const ctx = canvas.getContext('2d');

        function createKeyboard() {
            const keyboard = document.getElementById('keyboard');
            keyboard.innerHTML = '';
            const letters = 'АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ ';
            
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
            
            wrongGuesses = 0;
            gameActive = true;
            currentPosition = 0;

            document.getElementById('question').textContent = currentQuestion;
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('resetBtn').style.display = 'inline-block';
            document.getElementById('message').className = 'message hidden';
            document.getElementById('message').textContent = '';

            createKeyboard();
            updateDisplay();
            updateStats();
            drawHangman();
        }

        function guessLetter(letter) {
            if (!gameActive ) return;

            if (currentAnswer[currentPosition] === letter) {
                currentPosition++;
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
            for (let i = 0; i < currentAnswer.length; i++) {
                if (currentAnswer[i] === '') {
                    display += '  ';
                } else if (i < currentPosition) {
                    display += currentAnswer[i] + ' ';
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

                ctx.beginPath();
                ctx.moveTo(20, 280);
                ctx.lineTo(180, 280);
                ctx.stroke();
            
                ctx.beginPath();
                ctx.moveTo(60, 280);
                ctx.lineTo(60, 20);
                ctx.stroke();
            
                ctx.beginPath();
                ctx.moveTo(60, 20);
                ctx.lineTo(150, 20);
                ctx.stroke();
            

            if (wrongGuesses >= 1) {
                ctx.beginPath();
                ctx.moveTo(150, 20);
                ctx.lineTo(150, 50);
                ctx.stroke();
            }

            if (wrongGuesses >= 2) {
                ctx.beginPath();
                ctx.arc(150, 70, 20, 0, Math.PI * 2);
                ctx.stroke();
            }

            if (wrongGuesses >= 3) {
                ctx.beginPath();
                ctx.moveTo(150, 90);
                ctx.lineTo(150, 180);
                ctx.stroke();
            }

            if (wrongGuesses >= 4) {
                ctx.beginPath();
                ctx.moveTo(150, 110);
                ctx.lineTo(120, 150);
                ctx.stroke(); 
            }

            if(wrongGuesses >= 5) {  
                ctx.beginPath();
                ctx.moveTo(150, 110);
                ctx.lineTo(180, 150);
                ctx.stroke();
            }

            if (wrongGuesses >= 6) {   
                ctx.beginPath();
                ctx.moveTo(150, 180);
                ctx.lineTo(120, 240);
                ctx.stroke(); 
            }

                if (wrongGuesses >= 7) {
                ctx.beginPath();
                ctx.moveTo(150, 180);
                ctx.lineTo(180, 240);
                ctx.stroke();
            }
            
        }

        function checkWin() {
            if (currentPosition >= currentAnswer.length) {
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
