// Original quiz questions array - you can easily add more questions here
const originalQuestions = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
    },
    {
        question: "Which programming language is known as the 'language of the web'?",
        options: ["Python", "Java", "JavaScript", "C++"],
        correct: 2
    },
    {
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Home Tool Markup Language",
            "Hyperlink and Text Markup Language"
        ],
        correct: 0
    },
    {
        question: "What is the largest planet in our solar system?",
        options: ["Earth", "Saturn", "Jupiter", "Neptune"],
        correct: 2
    },
    {
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correct: 2
    }
];

// Shuffled questions array (will be set on init and restart)
let questions = [];

// Game state variables
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;
let answered = false;
let userName = ''; // Store the user's name

// DOM elements
const nameContainer = document.getElementById('name-container');
const nameInput = document.getElementById('name-input');
const nameError = document.getElementById('name-error');
const startQuizBtn = document.getElementById('start-quiz-btn');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const questionText = document.getElementById('question-text');
const optionButtons = document.querySelectorAll('.option-btn');
const nextButton = document.getElementById('next-btn');
const restartButton = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score');
const currentQuestionDisplay = document.getElementById('current-question');
const totalQuestionsDisplay = document.getElementById('total-questions');
const progressFill = document.getElementById('progress-fill');
const finalScoreDisplay = document.getElementById('final-score');
const totalScoreDisplay = document.getElementById('total-score');
const resultMessage = document.getElementById('result-message');
const leaderboardBody = document.getElementById('leaderboard-body');

// Leaderboard management functions
function getLeaderboard() {
    const leaderboardData = localStorage.getItem('quizLeaderboard');
    return leaderboardData ? JSON.parse(leaderboardData) : [];
}

function saveLeaderboard(leaderboard) {
    // Sort by score (highest to lowest) and keep only top 5
    const sorted = leaderboard.sort((a, b) => b.score - a.score);
    const top5 = sorted.slice(0, 5);
    localStorage.setItem('quizLeaderboard', JSON.stringify(top5));
    return top5;
}

function addScoreToLeaderboard(name, score) {
    const leaderboard = getLeaderboard();
    const timestamp = Date.now(); // Use timestamp to handle ties
    leaderboard.push({ name, score, timestamp });
    return saveLeaderboard(leaderboard);
}

function displayLeaderboard() {
    const leaderboard = getLeaderboard();
    leaderboardBody.innerHTML = '';

    if (leaderboard.length === 0) {
        leaderboardBody.innerHTML = '<tr><td colspan="3" class="no-scores">No scores yet. Be the first!</td></tr>';
        return;
    }

    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.score}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy to avoid mutating the original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Shuffle questions and options, preserving correct answers
function shuffleQuiz() {
    // Shuffle the order of questions
    const shuffledQuestions = shuffleArray(originalQuestions);
    
    // For each question, shuffle the options and update the correct index
    questions = shuffledQuestions.map(q => {
        const correctAnswer = q.options[q.correct];
        const shuffledOptions = shuffleArray(q.options);
        const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
        
        return {
            question: q.question,
            options: shuffledOptions,
            correct: newCorrectIndex
        };
    });
}

// Start the quiz after name is entered
function startQuiz() {
    // Get and trim the name input
    const name = nameInput.value.trim();
    
    // Validate name is not empty
    if (name === '') {
        nameError.classList.remove('hidden');
        nameInput.focus();
        return;
    }
    
    // Store the name
    userName = name;
    
    // Hide name container and show quiz container
    nameContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    
    // Initialize the quiz
    shuffleQuiz();
    totalQuestionsDisplay.textContent = questions.length;
    loadQuestion();
}

// Initialize the app (show name input screen)
function initApp() {
    // Show name input screen, hide quiz container
    nameContainer.classList.remove('hidden');
    quizContainer.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    
    // Focus on name input
    nameInput.focus();
}

// Initialize the quiz (called after name is entered)
function initQuiz() {
    shuffleQuiz();
    totalQuestionsDisplay.textContent = questions.length;
    loadQuestion();
}

// Load a question and update the UI
function loadQuestion() {
    // Reset state for new question
    answered = false;
    selectedOption = null;
    nextButton.disabled = true;

    // Get current question
    const currentQuestion = questions[currentQuestionIndex];

    // Update question text
    questionText.textContent = currentQuestion.question;

    // Update option buttons
    optionButtons.forEach((button, index) => {
        button.textContent = currentQuestion.options[index];
        button.className = 'option-btn'; // Reset classes
        button.disabled = false;
        
        // Add click event listener
        button.onclick = () => selectOption(index);
    });

    // Update progress
    currentQuestionDisplay.textContent = currentQuestionIndex + 1;
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = progress + '%';
}

// Handle option selection
function selectOption(index) {
    // Don't allow selection if already answered
    if (answered) return;

    selectedOption = index;
    answered = true;

    // Get current question
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = index === currentQuestion.correct;

    // Update button styles
    optionButtons.forEach((button, i) => {
        button.disabled = true;
        
        if (i === currentQuestion.correct) {
            button.classList.add('correct');
        } else if (i === index && !isCorrect) {
            button.classList.add('incorrect');
        }
        
        if (i === index) {
            button.classList.add('selected');
        }
    });

    // Update score if correct
    if (isCorrect) {
        score++;
        scoreDisplay.textContent = score;
    }

    // Enable next button
    nextButton.disabled = false;
}

// Move to next question or show results
function nextQuestion() {
    currentQuestionIndex++;

    // Check if quiz is complete
    if (currentQuestionIndex >= questions.length) {
        showResults();
    } else {
        loadQuestion();
    }
}

// Show results screen
function showResults() {
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    // Hide and disable the next button
    nextButton.style.display = 'none';
    nextButton.disabled = true;

    // Display final score
    finalScoreDisplay.textContent = score;
    totalScoreDisplay.textContent = questions.length;

    // Save score to leaderboard
    addScoreToLeaderboard(userName, score);

    // Display leaderboard
    displayLeaderboard();

    // Display result message based on performance (include user's name)
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) {
        resultMessage.textContent = `Perfect, ${userName}! You got everything right! 🎉`;
    } else if (percentage >= 80) {
        resultMessage.textContent = `Excellent work, ${userName}! You did great! 👏`;
    } else if (percentage >= 60) {
        resultMessage.textContent = `Good job, ${userName}! You're doing well! 👍`;
    } else if (percentage >= 40) {
        resultMessage.textContent = `Not bad, ${userName}! Keep practicing! 💪`;
    } else {
        resultMessage.textContent = `Keep studying, ${userName}! You'll do better next time! 📚`;
    }
}

// Restart the quiz
function restartQuiz() {
    // Shuffle questions and options for the new quiz
    shuffleQuiz();
    
    // Reset game state
    currentQuestionIndex = 0;
    score = 0;
    selectedOption = null;
    answered = false;

    // Reset UI
    scoreDisplay.textContent = 0;
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');

    // Show the next button again (it will be disabled by loadQuestion)
    nextButton.style.display = 'block';

    // Load first question
    loadQuestion();
}

// Event listeners
startQuizBtn.addEventListener('click', startQuiz);
nextButton.addEventListener('click', nextQuestion);
restartButton.addEventListener('click', restartQuiz);

// Allow Enter key to start quiz
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startQuiz();
    }
});

// Hide error message when user starts typing
nameInput.addEventListener('input', () => {
    if (!nameError.classList.contains('hidden')) {
        nameError.classList.add('hidden');
    }
});

// Initialize the app when page loads
initApp();

