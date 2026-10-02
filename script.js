// ============================================
// 1. BANK SOAL (2 SET BERBEDA)
// ============================================
const questionsSet1 = [
    { question: "Apa ibu kota negara Indonesia?", options: ["Jakarta", "Bandung", "Surabaya", "Medan"], correct: 0 },
    { question: "Berapa hasil dari 7 x 8?", options: ["54", "56", "48", "64"], correct: 1 },
    { question: "Planet terbesar di tata surya kita adalah?", options: ["Mars", "Saturnus", "Jupiter", "Neptunus"], correct: 2 },
    { question: "Siapa penemu lampu pijar?", options: ["Nikola Tesla", "Albert Einstein", "Isaac Newton", "Thomas Edison"], correct: 3 },
    { question: "Hewan apa yang merupakan lambang negara Indonesia?", options: ["Harimau", "Garuda", "Komodo", "Gajah"], correct: 1 }
];

const questionsSet2 = [
    { question: "Tag HTML yang digunakan untuk membuat paragraf adalah?", options: ["<div>", "<p>", "<h1>", "<span>"], correct: 1 },
    { question: "Apa kepanjangan dari CSS?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correct: 1 },
    { question: "Simbol untuk komentar satu baris di JavaScript adalah?", options: ["<!-- -->", "/* */", "//", "#"], correct: 2 },
    { question: "Fungsi untuk menampilkan teks di console JavaScript adalah?", options: ["print()", "echo()", "console.log()", "display()"], correct: 2 },
    { question: "Tipe data yang hanya memiliki nilai true atau false disebut?", options: ["String", "Integer", "Boolean", "Array"], correct: 2 }
];

// ============================================
// 2. VARIABEL STATE
// ============================================
let currentQuestionIndex = 0;
let score = 0;
let timerId = null;
let timeLeft = 15;
const TIME_LIMIT = 15;
let currentQuestions = []; 

// ============================================
// 3. DOM ELEMENTS
// ============================================
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionContainer = document.getElementById('question-container');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const progressBar = document.getElementById('progress-bar');
const questionCounter = document.getElementById('question-counter');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score-display');
const highScoreDisplay = document.getElementById('high-score-display');
const highScoreResult = document.getElementById('high-score-result');
const messageDisplay = document.getElementById('message');
const themeToggleBtn = document.getElementById('theme-toggle');
const historyContainer = document.getElementById('history-container');

// ============================================
// 4. INISIALISASI & EVENT LISTENERS
// ============================================
updateHighScoreDisplay();

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', handleNextQuestion);
restartBtn.addEventListener('click', playAgain);
menuBtn.addEventListener('click', resetQuiz);
themeToggleBtn.addEventListener('click', toggleTheme);

// ============================================
// 5. LOGIKA KUIS & PEMILIHAN SOAL
// ============================================
function getQuestionsForSession() {
    const history = getHistory();
    if (history.length % 2 === 0) {
        return questionsSet1; // Sesi Ganjil (1, 3, 5) -> Umum
    } else {
        return questionsSet2; // Sesi Genap (2, 4, 6) -> Coding
    }
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    currentQuestions = getQuestionsForSession();
    showScreen(quizScreen);
    loadQuestion();
    // Scroll ke atas saat mulai kuis
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function loadQuestion() {
    const q = currentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;
    progressBar.style.width = progress + '%';
    questionCounter.textContent = `Soal ${currentQuestionIndex + 1}/${currentQuestions.length}`;

    questionContainer.innerHTML = '';
    const questionText = document.createElement('p');
    questionText.textContent = q.question;
    questionContainer.appendChild(questionText);

    optionsContainer.innerHTML = '';
    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = option;
        btn.dataset.index = index; 
        optionsContainer.appendChild(btn);
    });

    nextBtn.classList.add('hidden');
    startTimer();
}

// ============================================
// 6. TIMER & EVENT DELEGATION
// ============================================
function startTimer() {
    timeLeft = TIME_LIMIT;
    timerDisplay.textContent = `️ ${timeLeft}s`;
    timerDisplay.classList.remove('warning');
    clearInterval(timerId); 
    
    timerId = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `⏱️ ${timeLeft}s`;
        if (timeLeft <= 5) timerDisplay.classList.add('warning');
        if (timeLeft <= 0) { clearInterval(timerId); handleTimeout(); }
    }, 1000);
}

function handleTimeout() {
    disableAllOptions();
    const correctIndex = currentQuestions[currentQuestionIndex].correct;
    const allOptions = optionsContainer.querySelectorAll('.option-btn');
    if(allOptions[correctIndex]) allOptions[correctIndex].classList.add('correct');
    showNextButton();
}

optionsContainer.addEventListener('click', function(e) {
    if (!e.target.classList.contains('option-btn')) return;
    if (e.target.classList.contains('disabled')) return;

    clearInterval(timerId); 
    const selectedIndex = parseInt(e.target.dataset.index);
    const correctIndex = currentQuestions[currentQuestionIndex].correct;
    const allOptions = optionsContainer.querySelectorAll('.option-btn');

    disableAllOptions(); 
    if (selectedIndex === correctIndex) {
        e.target.classList.add('correct'); 
        score++;
    } else {
        e.target.classList.add('wrong');   
        if(allOptions[correctIndex]) allOptions[correctIndex].classList.add('correct');
    }
    showNextButton();
});

function disableAllOptions() {
    const allOptions = optionsContainer.querySelectorAll('.option-btn');
    allOptions.forEach(btn => btn.classList.add('disabled'));
}

function showNextButton() {
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = (currentQuestionIndex === currentQuestions.length - 1) ? 'Lihat Hasil 🏆' : 'Soal Berikutnya ➡️';
}

function handleNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

// ============================================
// 7. HASIL, LOCALSTORAGE & RIWAYAT
// ============================================
function showResult() {
    showScreen(resultScreen);
    progressBar.style.width = '100%';
    scoreDisplay.textContent = `${score}/${currentQuestions.length}`;
    
    saveHighScore(score);
    saveHistory(score);
    updateHighScoreDisplay();
    renderHistory();

    if (score === currentQuestions.length) messageDisplay.textContent = ' Sempurna! Kamu luar biasa!';
    else if (score >= 3) messageDisplay.textContent = '👏 Bagus! Terus tingkatkan!';
    else messageDisplay.textContent = '💪 Jangan menyerah, coba lagi!';

    // Scroll ke atas saat hasil muncul
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function playAgain() {
    currentQuestionIndex = 0;
    score = 0;
    currentQuestions = getQuestionsForSession(); // Otomatis ganti sesi soal
    showScreen(quizScreen);
    loadQuestion();
    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetQuiz() {
    showScreen(startScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getHighScore() {
    const savedScore = localStorage.getItem('quizHighScore');
    return savedScore ? parseInt(savedScore, 10) : 0;
}

function saveHighScore(newScore) {
    const currentHigh = getHighScore();
    if (newScore > currentHigh) localStorage.setItem('quizHighScore', newScore);
}

function updateHighScoreDisplay() {
    const highScore = getHighScore();
    highScoreDisplay.textContent = highScore;
    highScoreResult.textContent = highScore;
}

function getHistory() {
    const savedHistory = localStorage.getItem('quizHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
}

function saveHistory(newScore) {
    let history = getHistory();
    let attemptNumber = history.length + 1; 
    let time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    let sessionType = (history.length % 2 === 0) ? 'Umum' : 'Coding';

    history.push({ attempt: attemptNumber, score: newScore, time: time, type: sessionType });
    localStorage.setItem('quizHistory', JSON.stringify(history));
}

function renderHistory() {
    historyContainer.innerHTML = ''; 
    let history = getHistory();
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">Belum ada riwayat.</p>';
        return;
    }

    history.slice().reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        let badgeColor = item.type === 'Coding' ? 'background:rgba(0,114,255,0.2); color:#00c6ff;' : 'background:rgba(255,215,0,0.1); color:#ffd700;';
        
        div.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:flex-start;">
                <span class="attempt-num">Pengerjaan ke-${item.attempt} <small>(${item.time})</small></span>
                <span style="font-size:0.75rem; padding:2px 8px; border-radius:10px; margin-top:4px; ${badgeColor}">Sesi ${item.type}</span>
            </div>
            <span class="attempt-score">${item.score}/5</span>
        `;
        historyContainer.appendChild(div);
    });
}

// ============================================
// 8. DARK/LIGHT MODE
// ============================================
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    themeToggleBtn.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
}