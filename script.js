// DOM elements
const elements = {
    screens: {
        mainMenu: document.getElementById('main-menu'),
        setup: document.getElementById('setup-screen'),
        game: document.getElementById('game-screen'),
        gameOver: document.getElementById('game-over'),
        dailyChallenge: document.getElementById('daily-challenge-screen'),
        tutorial: document.getElementById('tutorial-screen')
    },
    buttons: {
        singlePlayer: document.getElementById('single-player'),
        vsAI: document.getElementById('vs-ai'),
        highScores: document.getElementById('high-scores-btn'),
        playAgain: document.getElementById('play-again'),
        mainMenu: document.getElementById('main-menu-btn'),
        dailyChallenge: document.getElementById('daily-challenge-btn'),
        startDailyChallenge: document.getElementById('start-daily-challenge'),
        backToMenu: document.getElementById('back-to-menu'),
        howToPlay: document.getElementById('how-to-play'),
        skipTutorial: document.getElementById('skip-tutorial'),
        startPlaying: document.getElementById('start-playing'),
        helpBtn: document.getElementById('help-btn'),
        pauseBtn: document.getElementById('pause-btn'),
        restartBtn: document.getElementById('restart-btn'),
        stopBtn: document.getElementById('stop-btn')
    },
    setupForm: document.getElementById('game-setup'),
    aiDifficultyGroup: document.getElementById('ai-difficulty-group'),
    playerNameDisplay: document.getElementById('player-name-display'),
    playerAvatar: document.getElementById('player-avatar'),
    scoreDisplay: document.getElementById('score-value'),
    streakIndicator: document.getElementById('streak-indicator'),
    streakCount: document.getElementById('streak-count'),
    timerProgress: document.getElementById('timer-progress'),
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    resultMessage: document.getElementById('result-message'),
    finalScore: document.getElementById('final-score'),
    highScoresList: document.getElementById('high-scores-list'),
    resetTimer: document.getElementById('reset-timer'),
    confettiCanvas: document.getElementById('confetti-canvas'),
    stoppageTimeDisplay: document.getElementById('stoppage-time-value'),
    stoppageTimeContainer: document.getElementById('stoppage-time')
};

// Game state
const gameState = {
    mode: 'single', // 'single', 'ai', or 'daily'
    player: {
        name: 'Player',
        avatar: 'P',
        score: 0,
        streak: 0,
        correctAnswers: 0,
        dailyChallengeCompleted: false
    },
    ai: {
        name: 'AI Opponent',
        avatar: 'AI',
        score: 0,
        difficulty: 'medium',
        responseTime: {
            easy: [3000, 6000],
            medium: [2000, 4000],
            hard: [1000, 3000]
        },
        accuracy: {
            easy: 0.6,
            medium: 0.75,
            hard: 0.9
        }
    },
    currentQuestion: 0,
    questions: [],
    usedQuestionIndices: new Set(),
    timer: null,
    timeLeft: 0,
    totalTime: 15,
    isPaused: false,
    lifelines: {
        '5050': { available: true },
        'freeze': { available: true },
        'double': { available: true },
        'skip': { available: true }
    },
    doublePointsActive: false,
    categories: {
        9: "General Knowledge",
        17: "Science & Nature",
        18: "Computers",
        19: "Mathematics",
        21: "Sports",
        22: "Geography",
        23: "History",
        25: "Art",
        27: "Animals"
    },
    dailyChallenge: {
        date: null,
        completed: false,
        questions: [],
        currentStreak: 0
    },
    tutorial: {
        active: false,
        step: 0
    },
    // Stoppage time properties
    stoppageTime: 0,
    maxStoppageTime: 30,
    baseTimePerQuestion: 15,
    questionStartTime: 0
};

// Sample questions with correct values (positions will be randomized)
const sampleQuestions = [
    // General Knowledge
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Madrid", "Paris"],
        correctAnswer: "Paris",
        category: "General Knowledge",
        difficulty: "easy"
    },
    // Science & Nature
    {
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "NaCl", "O2"],
        correctAnswer: "H2O",
        category: "Science & Nature",
        difficulty: "easy"
    },
    // Mathematics
    {
        question: "What is 7 × 8?",
        options: ["42", "54", "56", "64"],
        correctAnswer: "56",
        category: "Mathematics",
        difficulty: "easy"
    },
    {
        question: "What is the square root of 144?",
        options: ["10", "12", "14", "16"],
        correctAnswer: "12",
        category: "Mathematics",
        difficulty: "medium"
    },
    // Computers
    {
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "Home Tool Markup Language",
            "Hyperlinks and Text Markup Language",
            "Hyper Text Makeup Language"
        ],
        correctAnswer: "Hyper Text Markup Language",
        category: "Computers",
        difficulty: "medium"
    },
    // History
    {
        question: "In which year did World War II end?",
        options: ["1943", "1945", "1947", "1950"],
        correctAnswer: "1945",
        category: "History",
        difficulty: "medium"
    },
    // Animals
    {
        question: "What is the fastest land animal?",
        options: ["Lion", "Cheetah", "Gazelle", "Pronghorn Antelope"],
        correctAnswer: "Cheetah",
        category: "Animals",
        difficulty: "easy"
    }
];

// Initialize the game
function init() {
    // Load high scores from localStorage
    if (!localStorage.getItem('quizBattleHighScores')) {
        localStorage.setItem('quizBattleHighScores', JSON.stringify([]));
    }
    
    // Load daily challenge status
    if (localStorage.getItem('dailyChallenge')) {
        gameState.dailyChallenge = JSON.parse(localStorage.getItem('dailyChallenge'));
    }
    
    // Set up daily challenge reset timer
    updateDailyChallengeTimer();
    setInterval(updateDailyChallengeTimer, 60000);
    
    // Event listeners
    setupEventListeners();
    
    // Set player name from localStorage if available
    if (localStorage.getItem('playerName')) {
        document.getElementById('player-name').value = localStorage.getItem('playerName');
    }
    
    // Show main menu initially
    showMainMenu();
}

function setupEventListeners() {
    // Game mode selection
    elements.buttons.singlePlayer.addEventListener('click', () => {
        gameState.mode = 'single';
        showSetupScreen();
    });
    
    elements.buttons.vsAI.addEventListener('click', () => {
        gameState.mode = 'ai';
        showSetupScreen();
    });
    
    // Navigation buttons
    elements.buttons.highScores.addEventListener('click', showHighScores);
    elements.buttons.playAgain.addEventListener('click', resetGame);
    elements.buttons.mainMenu.addEventListener('click', showMainMenu);
    elements.buttons.dailyChallenge.addEventListener('click', showDailyChallengeScreen);
    elements.buttons.startDailyChallenge.addEventListener('click', startDailyChallenge);
    elements.buttons.backToMenu.addEventListener('click', showMainMenu);
    elements.buttons.howToPlay.addEventListener('click', showTutorial);
    elements.buttons.skipTutorial.addEventListener('click', showMainMenu);
    elements.buttons.startPlaying.addEventListener('click', () => {
        showMainMenu();
        startTutorialInGame();
    });
    elements.buttons.helpBtn.addEventListener('click', showTutorial);
    
    // Game control buttons
    elements.buttons.pauseBtn.addEventListener('click', togglePause);
    elements.buttons.restartBtn.addEventListener('click', restartQuestion);
    elements.buttons.stopBtn.addEventListener('click', endGame);
    
    // Form submission
    elements.setupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        startGame();
    });
    
    // Add event listeners to option buttons
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function() {
            if (!this.disabled) {
                selectAnswer(this);
            }
        });
    });
    
    // Add event listeners to lifeline buttons
    document.querySelectorAll('.lifeline').forEach(lifeline => {
        lifeline.addEventListener('click', function() {
            if (!this.disabled) {
                useLifeline(this);
            }
        });
    });
}

// Screen navigation functions
function showMainMenu() {
    hideAllScreens();
    elements.screens.mainMenu.classList.remove('hidden');
    elements.aiDifficultyGroup.style.display = 'none';
}

function showSetupScreen() {
    hideAllScreens();
    elements.screens.setup.classList.remove('hidden');
    
    if (gameState.mode === 'ai') {
        elements.aiDifficultyGroup.style.display = 'flex';
    } else {
        elements.aiDifficultyGroup.style.display = 'none';
    }
}

function showGameScreen() {
    hideAllScreens();
    elements.screens.game.classList.remove('hidden');
}

function showGameOverScreen() {
    hideAllScreens();
    elements.screens.gameOver.classList.remove('hidden');
    displayGameResults();
    updateHighScoresList();
}

function showDailyChallengeScreen() {
    hideAllScreens();
    elements.screens.dailyChallenge.classList.remove('hidden');
    updateDailyChallengeTimer();
}

function showTutorial() {
    hideAllScreens();
    elements.screens.tutorial.classList.remove('hidden');
}

function hideAllScreens() {
    Object.values(elements.screens).forEach(screen => {
        screen.classList.add('hidden');
    });
}

// Game functions
async function startGame() {
    // Get setup values
    gameState.player.name = document.getElementById('player-name').value || 'Player';
    gameState.player.avatar = gameState.player.name.charAt(0).toUpperCase();
    
    // Save player name to localStorage
    localStorage.setItem('playerName', gameState.player.name);
    
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    
    if (gameState.mode === 'ai') {
        gameState.ai.difficulty = document.getElementById('ai-difficulty').value;
    }
    
    // Update player display
    elements.playerNameDisplay.textContent = gameState.player.name;
    elements.playerAvatar.textContent = gameState.player.avatar;
    
    // Reset game state
    resetGameState();
    
    // Set timer based on difficulty
    gameState.totalTime = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 15 : 20;
    gameState.baseTimePerQuestion = gameState.totalTime;
    
    // Load questions
    gameState.questions = await loadQuestions(category, difficulty);
    showGameScreen();
    loadQuestion();
    
    // Start in-game tutorial if first time
    if (!localStorage.getItem('tutorialCompleted')) {
        startTutorialInGame();
    }
}

async function startDailyChallenge() {
    gameState.mode = 'daily';
    gameState.player.name = document.getElementById('player-name').value || 'Player';
    gameState.player.avatar = gameState.player.name.charAt(0).toUpperCase();
    
    // Update player display
    elements.playerNameDisplay.textContent = gameState.player.name;
    elements.playerAvatar.textContent = gameState.player.avatar;
    
    // Reset game state
    resetGameState();
    
    // Set fixed parameters for daily challenge
    gameState.totalTime = 15;
    gameState.baseTimePerQuestion = gameState.totalTime;
    
    // Check if we already have daily questions
    if (gameState.dailyChallenge.date === new Date().toDateString() && 
        gameState.dailyChallenge.questions.length > 0) {
        gameState.questions = gameState.dailyChallenge.questions;
        showGameScreen();
        loadQuestion();
        return;
    }
    
    // Load new daily questions
    gameState.questions = await loadDailyQuestions();
    showGameScreen();
    loadQuestion();
}

async function loadQuestions(category, difficulty) {
    try {
        // Try to fetch from Open Trivia DB
        const response = await fetch(
            `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`
        );
        const data = await response.json();
        
        if (data.response_code === 0) {
            return data.results.map(q => {
                // Get random position for correct answer (0-3)
                const correctPos = Math.floor(Math.random() * 4);
                const options = [...q.incorrect_answers];
                // Insert correct answer at random position
                options.splice(correctPos, 0, q.correct_answer);
                
                return {
                    question: decodeHTML(q.question),
                    options: options.map(a => decodeHTML(a)),
                    correctAnswer: correctPos,
                    category: q.category,
                    difficulty: q.difficulty
                };
            });
        }
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
    
    // Fallback to sample questions if API fails
    return getRandomizedSampleQuestions(category, difficulty);
}

async function loadDailyQuestions() {
    try {
        // Try to fetch from Open Trivia DB (10 mixed questions)
        const response = await fetch(
            `https://opentdb.com/api.php?amount=10&type=multiple`
        );
        const data = await response.json();
        
        if (data.response_code === 0) {
            return data.results.map(q => {
                // Get random position for correct answer (0-3)
                const correctPos = Math.floor(Math.random() * 4);
                const options = [...q.incorrect_answers];
                // Insert correct answer at random position
                options.splice(correctPos, 0, q.correct_answer);
                
                return {
                    question: decodeHTML(q.question),
                    options: options.map(a => decodeHTML(a)),
                    correctAnswer: correctPos,
                    category: q.category,
                    difficulty: q.difficulty
                };
            });
        }
    } catch (error) {
        console.error("Error fetching daily questions:", error);
    }
    
    // Fallback to sample questions if API fails
    return getRandomizedSampleQuestions();
}

function getRandomizedSampleQuestions(category, difficulty) {
    // Filter sample questions if category/difficulty specified
    let questions = sampleQuestions;
    if (category && difficulty) {
        questions = sampleQuestions.filter(q => 
            q.difficulty === difficulty && 
            q.category === gameState.categories[category]
        );
    }
    
    // If no questions match, use all samples
    if (questions.length === 0) {
        questions = sampleQuestions;
    }
    
    // Randomize correct answer positions
    return questions.map(q => {
        const options = [...q.options];
        const correctValue = q.correctAnswer;
        
        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        // Find new position of correct answer
        const correctPos = options.indexOf(correctValue);
        
        return {
            question: q.question,
            options: options,
            correctAnswer: correctPos,
            category: q.category,
            difficulty: q.difficulty
        };
    });
}

function loadQuestion() {
    if (gameState.usedQuestionIndices.size >= gameState.questions.length) {
        // Reset used questions if we've gone through them all
        gameState.usedQuestionIndices.clear();
    }

    // Get a random question that hasn't been used yet
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * gameState.questions.length);
    } while (gameState.usedQuestionIndices.has(randomIndex));

    gameState.usedQuestionIndices.add(randomIndex);
    gameState.currentQuestion = randomIndex;

    const question = gameState.questions[randomIndex];
    elements.questionText.textContent = question.question;
    
    // Reset options
    const optionButtons = elements.optionsContainer.querySelectorAll('.option');
    optionButtons.forEach((option, index) => {
        option.textContent = question.options[index];
        option.classList.remove('correct', 'wrong');
        option.disabled = false;
        option.style.visibility = 'visible';
    });
    
    // Reset lifelines (except double points which persists until used)
    if (!gameState.doublePointsActive) {
        gameState.lifelines.double.available = true;
        document.querySelector('[data-power="double"]').textContent = '🔥';
    }
    
    // Start timer
    startTimer();
    
    // AI answers in vs AI mode
    if (gameState.mode === 'ai') {
        aiAnswer();
    }
}

function startTimer() {
    gameState.timeLeft = gameState.totalTime;
    elements.timerProgress.style.width = '100%';
    elements.timerProgress.style.backgroundColor = 'var(--primary)';
    gameState.isPaused = false;
    elements.buttons.pauseBtn.textContent = '⏸️';
    
    // Track when the question was displayed for stoppage time calculation
    gameState.questionStartTime = Date.now();
    
    clearInterval(gameState.timer);
    gameState.timer = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.timeLeft--;
            const percentage = (gameState.timeLeft / gameState.totalTime) * 100;
            elements.timerProgress.style.width = `${percentage}%`;
            
            // Change color when time is running out
            if (percentage < 30) {
                elements.timerProgress.style.backgroundColor = 'var(--secondary)';
            }
            
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timer);
                timeUp();
            }
        }
    }, 1000);
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    elements.buttons.pauseBtn.textContent = gameState.isPaused ? '▶️' : '⏸️';
}

function restartQuestion() {
    clearInterval(gameState.timer);
    loadQuestion();
}

function timeUp() {
    disableAllOptions();
    showCorrectAnswer();
    
    // Penalty for not answering
    gameState.player.streak = 0;
    updateStreakDisplay();
    
    setTimeout(() => {
        loadQuestion();
    }, 2000);
}

function selectAnswer(selectedOption) {
    clearInterval(gameState.timer);
    disableAllOptions();
    
    // Calculate time taken and potential stoppage time
    const timeTaken = (Date.now() - gameState.questionStartTime) / 1000;
    const timeSaved = gameState.baseTimePerQuestion - timeTaken;
    
    // Add to stoppage time (capped at max)
    if (timeSaved > 0) {
        const timeToAdd = Math.floor(timeSaved);
        gameState.stoppageTime = Math.min(
            gameState.stoppageTime + timeToAdd,
            gameState.maxStoppageTime
        );
        
        // Update display with animation
        elements.stoppageTimeDisplay.textContent = `${gameState.stoppageTime}s`;
        elements.stoppageTimeContainer.classList.add('time-added');
        setTimeout(() => {
            elements.stoppageTimeContainer.classList.remove('time-added');
        }, 500);
    }
    
    const selectedIndex = parseInt(selectedOption.dataset.option) - 1;
    const correctAnswer = gameState.questions[gameState.currentQuestion].correctAnswer;
    
    // Check if answer is correct
    if (selectedIndex === correctAnswer) {
        handleCorrectAnswer();
        selectedOption.classList.add('correct');
    } else {
        handleWrongAnswer();
        selectedOption.classList.add('wrong');
        // Show correct answer
        document.querySelectorAll('.option')[correctAnswer].classList.add('correct');
    }
    
    // Move to next question after delay
    setTimeout(() => {
        loadQuestion();
    }, 2000);
}

function handleCorrectAnswer() {
    // Calculate score (base 100 + time bonus + streak bonus)
    let points = 100 + Math.floor(gameState.timeLeft * 3);
    
    // Streak bonus (every 3 correct answers in a row)
    gameState.player.streak++;
    gameState.player.correctAnswers++;
    
    if (gameState.player.streak >= 3) {
        points += 50 * Math.floor(gameState.player.streak / 3);
    }
    
    // Double points lifeline
    if (gameState.doublePointsActive) {
        points *= 2;
        gameState.doublePointsActive = false;
        document.querySelector('[data-power="double"]').textContent = '🔥';
    }
    
    gameState.player.score += points;
    elements.scoreDisplay.textContent = gameState.player.score;
    updateStreakDisplay();
}

function handleWrongAnswer() {
    gameState.player.streak = 0;
    updateStreakDisplay();
}

function updateStreakDisplay() {
    if (gameState.player.streak > 0) {
        elements.streakIndicator.style.display = 'flex';
        elements.streakCount.textContent = gameState.player.streak;
    } else {
        elements.streakIndicator.style.display = 'none';
    }
}

function disableAllOptions() {
    document.querySelectorAll('.option').forEach(option => {
        option.disabled = true;
    });
}

function showCorrectAnswer() {
    const correctAnswer = gameState.questions[gameState.currentQuestion].correctAnswer;
    document.querySelectorAll('.option')[correctAnswer].classList.add('correct');
}

function useLifeline(button) {
    const power = button.dataset.power;
    
    if (!gameState.lifelines[power].available) return;
    
    gameState.lifelines[power].available = false;
    button.disabled = true;
    button.style.opacity = '0.5';
    
    switch(power) {
        case '5050':
            const correct = gameState.questions[gameState.currentQuestion].correctAnswer;
            let optionsToRemove = [];
            
            // Find two wrong options to remove
            for (let i = 0; i < 4; i++) {
                if (i !== correct && optionsToRemove.length < 2) {
                    optionsToRemove.push(i);
                }
            }
            
            // Hide the wrong options
            optionsToRemove.forEach(index => {
                document.querySelectorAll('.option')[index].style.visibility = 'hidden';
            });
            break;
            
        case 'freeze':
            // Add 5 seconds to timer
            gameState.timeLeft += 5;
            const currentWidth = elements.timerProgress.style.width;
            const newWidth = parseFloat(currentWidth) + (5/gameState.totalTime*100);
            elements.timerProgress.style.width = `${Math.min(newWidth, 100)}%`;
            break;
            
        case 'double':
            gameState.doublePointsActive = true;
            button.textContent = '2X ACTIVE';
            break;
            
        case 'skip':
            clearInterval(gameState.timer);
            loadQuestion();
            break;
    }
}

function aiAnswer() {
    const [min, max] = gameState.ai.responseTime[gameState.ai.difficulty];
    const delay = Math.random() * (max - min) + min;
    const accuracy = gameState.ai.accuracy[gameState.ai.difficulty];
    
    setTimeout(() => {
        if (Math.random() < accuracy) {
            // Answer correctly
            const correctIndex = gameState.questions[gameState.currentQuestion].correctAnswer;
            document.querySelectorAll('.option')[correctIndex].click();
        } else {
            // Answer randomly (excluding correct answer)
            let options = [0, 1, 2, 3];
            const correct = gameState.questions[gameState.currentQuestion].correctAnswer;
            options = options.filter(opt => opt !== correct);
            const randomIndex = options[Math.floor(Math.random() * options.length)];
            document.querySelectorAll('.option')[randomIndex].click();
        }
    }, delay);
}

function endGame() {
    clearInterval(gameState.timer);
    
    // Apply stoppage time if in single player mode
    if (gameState.mode === 'single' && gameState.stoppageTime > 0) {
        // Add bonus points for unused stoppage time
        const bonusPoints = gameState.stoppageTime * 10;
        gameState.player.score += bonusPoints;
        
        // Show stoppage time bonus
        elements.resultMessage.innerHTML = `
            <p>Stoppage Time Bonus: +${gameState.stoppageTime}s (${bonusPoints} points)</p>
            ${elements.resultMessage.innerHTML}
        `;
    }
    
    showGameOverScreen();
    
    // Show confetti if score is high
    const highScores = JSON.parse(localStorage.getItem('quizBattleHighScores'));
    if (highScores.length === 0 || gameState.player.score > highScores[0].score) {
        showConfetti();
    }
}

function displayGameResults() {
    const accuracy = gameState.questions.length > 0 
        ? Math.round((gameState.player.correctAnswers / gameState.questions.length) * 100) 
        : 0;
    
    let message = `You answered ${gameState.player.correctAnswers} out of ${gameState.questions.length} correctly (${accuracy}% accuracy)`;
    
    if (gameState.mode === 'daily') {
        if (gameState.player.correctAnswers >= 10) {
            message += "\n\n🎉 Daily Challenge Complete! +500 bonus points!";
            gameState.player.score += 500;
        } else {
            message += "\n\nComplete 10 correct answers to finish the Daily Challenge!";
        }
    }
    
    elements.resultMessage.innerHTML = message.replace(/\n\n/g, '<br><br>');
    elements.finalScore.textContent = gameState.player.score;
}

function updateHighScoresList() {
    const highScores = JSON.parse(localStorage.getItem('quizBattleHighScores'));
    const newScore = {
        name: gameState.player.name,
        score: gameState.player.score,
        date: new Date().toLocaleDateString(),
        mode: gameState.mode
    };
    
    // Add new score and sort
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    if (highScores.length > 10) {
        highScores.length = 10;
    }
    
    // Save back to localStorage
    localStorage.setItem('quizBattleHighScores', JSON.stringify(highScores));
    
    // Display high scores
    elements.highScoresList.innerHTML = highScores
        .map((score, index) => `
            <div class="high-score-item ${score.name === gameState.player.name && score.score === gameState.player.score ? 'current' : ''}">
                <span>${index + 1}. ${score.name} ${score.mode === 'daily' ? '🌟' : ''}</span>
                <span>${score.score}</span>
            </div>
        `)
        .join('');
}

function showHighScores() {
    updateHighScoresList();
    hideAllScreens();
    elements.screens.gameOver.classList.remove('hidden');
    elements.resultMessage.textContent = 'High Scores';
    elements.finalScore.textContent = '';
}

function resetGame() {
    // Reset game state
    resetGameState();
    
    // Reset lifelines display
    document.querySelectorAll('.lifeline').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        if (btn.dataset.power === 'double') {
            btn.textContent = '🔥';
        }
    });
    
    // Start new game with same settings
    if (gameState.mode === 'daily') {
        startDailyChallenge();
    } else {
        startGame();
    }
}

function resetGameState() {
    gameState.player.score = 0;
    gameState.player.streak = 0;
    gameState.player.correctAnswers = 0;
    gameState.currentQuestion = 0;
    gameState.timeLeft = 0;
    gameState.stoppageTime = 0;
    gameState.doublePointsActive = false;
    gameState.usedQuestionIndices.clear();
    
    // Reset display
    elements.stoppageTimeDisplay.textContent = '0s';
    
    // Reset lifelines
    Object.keys(gameState.lifelines).forEach(key => {
        gameState.lifelines[key].available = true;
    });
    
    elements.scoreDisplay.textContent = '0';
    updateStreakDisplay();
}

function updateDailyChallengeTimer() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    elements.resetTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Tutorial functions
function startTutorialInGame() {
    if (localStorage.getItem('tutorialCompleted')) return;
    
    gameState.tutorial.active = true;
    gameState.tutorial.step = 0;
    
    // Show first tutorial tip
    showTutorialTip();
}

function showTutorialTip() {
    // Remove any existing tutorial bubbles
    document.querySelectorAll('.tutorial-bubble').forEach(el => el.remove());
    
    const tips = [
        {
            text: "Welcome to Quiz Battle! Answer questions before time runs out!",
            element: elements.questionText,
            position: "top"
        },
        {
            text: "This is the timer. Answer quickly to earn stoppage time!",
            element: elements.timerProgress,
            position: "top"
        },
        {
            text: "Select the correct answer from these options.",
            element: elements.optionsContainer,
            position: "top"
        },
        {
            text: "Use lifelines when you're stuck. Try the 50/50 now!",
            element: document.querySelector('[data-power="5050"]'),
            position: "top"
        },
        {
            text: "Use these controls to pause, restart, or stop the game",
            element: document.querySelector('.game-controls'),
            position: "top"
        }
    ];
    
    if (gameState.tutorial.step >= tips.length) {
        // Tutorial complete
        localStorage.setItem('tutorialCompleted', 'true');
        gameState.tutorial.active = false;
        return;
    }
    
    const tip = tips[gameState.tutorial.step];
    const rect = tip.element.getBoundingClientRect();
    
    const bubble = document.createElement('div');
    bubble.className = `tutorial-bubble ${tip.position}`;
    bubble.textContent = tip.text;
    
    // Position the bubble
    if (tip.position === "top") {
        bubble.style.left = `${rect.left + rect.width / 2}px`;
        bubble.style.top = `${rect.top - 10}px`;
        bubble.style.transform = 'translate(-50%, -100%)';
    } else if (tip.position === "bottom") {
        bubble.style.left = `${rect.left + rect.width / 2}px`;
        bubble.style.top = `${rect.bottom + 10}px`;
        bubble.style.transform = 'translate(-50%, 0)';
    } else if (tip.position === "left") {
        bubble.style.left = `${rect.left - 10}px`;
        bubble.style.top = `${rect.top + rect.height / 2}px`;
        bubble.style.transform = 'translate(-100%, -50%)';
    } else if (tip.position === "right") {
        bubble.style.left = `${rect.right + 10}px`;
        bubble.style.top = `${rect.top + rect.height / 2}px`;
        bubble.style.transform = 'translate(0, -50%)';
    }
    
    document.body.appendChild(bubble);
    
    // Advance to next step when user interacts
    const nextStep = () => {
        gameState.tutorial.step++;
        showTutorialTip();
    };
    
    if (gameState.tutorial.step === 3) {
        // Special case for 50/50 lifeline
        document.querySelector('[data-power="5050"]').addEventListener('click', function handler() {
            nextStep();
            this.removeEventListener('click', handler);
        }, { once: true });
    } else {
        document.addEventListener('click', function handler() {
            nextStep();
            document.removeEventListener('click', handler);
        }, { once: true });
    }
}

// Helper functions
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function showConfetti() {
    elements.confettiCanvas.classList.remove('hidden');
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#f72585', '#b5179e', '#7209b7', '#560bad', '#480ca8', '#3a0ca3', '#3f37c9', '#4361ee', '#4895ef', '#4cc9f0'];
    
    // Create particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            rotation: Math.random() * 0.2 - 0.1
        });
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.angle);
            
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            
            ctx.restore();
            
            particle.y += particle.speed;
            particle.angle += particle.rotation;
            
            if (particle.y > canvas.height) {
                particle.y = -particle.size;
                particle.x = Math.random() * canvas.width;
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Stop after 3 seconds
    setTimeout(() => {
        elements.confettiCanvas.classList.add('hidden');
    }, 3000);
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
