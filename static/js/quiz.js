// EcoBeach - Quiz Functionality

// Quiz data structure
const quizData = {
    biodiversidade: [
        {
            question: "Qual é o nome científico da tartaruga que desova nas praias de Guriri?",
            options: [
                "Caretta caretta",
                "Chelonia mydas", 
                "Eretmochelys imbricata",
                "Lepidochelys olivacea"
            ],
            correct: 0,
            explanation: "A Caretta caretta, conhecida como tartaruga-cabeçuda, é a espécie que mais frequentemente desova nas praias de Guriri, especialmente entre setembro e março."
        },
        {
            question: "Qual peixe é considerado base da pesca artesanal tradicional em Guriri?",
            options: [
                "Robalo",
                "Tainha",
                "Bagre",
                "Dourada"
            ],
            correct: 1,
            explanation: "A tainha (Mugil liza) é uma espécie migratória que chega à região durante o inverno e é tradicionalmente pescada pelos caiçaras há gerações."
        },
        {
            question: "O que significa a palavra 'Guriri' na língua indígena?",
            options: [
                "Água grande",
                "Coco pequeno",
                "Terra sagrada",
                "Praia bonita"
            ],
            correct: 1,
            explanation: "Guriri significa coco pequeno por causa da planta encontrada na região (Allagoptera arenaria)."
        },
        {
            question: "Qual é a principal função da vegetação de restinga?",
            options: [
                "Apenas decoração natural",
                "Fixação das dunas e proteção costeira",
                "Produção de madeira",
                "Atração de turistas"
            ],
            correct: 1,
            explanation: "A vegetação de restinga é fundamental para fixar as dunas costeiras, protegendo a costa da erosão e mantendo o ecossistema equilibrado."
        },
        {
            question: "Em que período do ano é possível avistar baleias jubarte na costa de Guriri?",
            options: [
                "Janeiro a março",
                "Abril a junho", 
                "Julho a novembro",
                "Durante todo o ano"
            ],
            correct: 2,
            explanation: "As baleias jubarte migram pela costa brasileira entre julho e novembro, sendo este o melhor período para avistá-las nas águas próximas a Guriri."
        },
        {
            question: "Qual dessas plantas é característica da flora costeira de Guriri?",
            options: [
                "Pau-brasil",
                "Salsa da praia",
                "Ipê amarelo",
                "Jequitibá"
            ],
            correct: 1,
            explanation: "A salsa da praia (Ipomoea pes-caprae) é uma planta rasteira típica das dunas costeiras, fundamental para a estabilização da areia."
        },
        {
            question: "Por que o cavalo marinho está na lista de espécies vulneráveis?",
            options: [
                "Mudanças climáticas apenas",
                "Pesca predatória apenas",
                "Destruição de habitat e pesca predatória",
                "Poluição apenas"
            ],
            correct: 2,
            explanation: "O cavalo marinho sofre com a destruição de seu habitat natural (pradarias marinhas e mangues) e também com a pesca predatória para uso medicinal."
        },
        {
            question: "Qual é o papel dos pescadores caiçaras na conservação marinha?",
            options: [
                "Apenas pescar",
                "Praticar pesca sustentável e preservar tradições",
                "Explorar recursos sem limites",
                "Não têm papel importante"
            ],
            correct: 1,
            explanation: "Os pescadores caiçaras são guardiões do conhecimento tradicional sobre pesca sustentável, respeitando períodos de defeso e preservando técnicas ancestrais."
        },
        {
            question: "Quantos anos uma garrafa plástica leva para se decomper no ambiente marinho?",
            options: [
                "50 anos",
                "100 anos",
                "200 anos",
                "450 anos"
            ],
            correct: 3,
            explanation: "Uma garrafa plástica pode levar até 450 anos para se decomper completamente no ambiente marinho, causando danos imensos à vida aquática."
        },
        {
            question: "Qual é a melhor forma de observar a vida marinha sem causar impacto?",
            options: [
                "Tocar os animais para conhecê-los melhor",
                "Usar flash para fotografar",
                "Observar à distância respeitosa",
                "Alimentar os peixes"
            ],
            correct: 2,
            explanation: "A observação respeitosa à distância permite apreciar a vida marinha sem interferir em seu comportamento natural ou causar estresse aos animais."
        }
    ]
};

// Quiz state
let currentQuiz = null;
let currentQuestion = 0;
let score = 0;
let timeLeft = 30;
let timer = null;
let userAnswers = [];

// Initialize quiz
function startQuiz(quizType = 'biodiversidade') {
    currentQuiz = quizData[quizType];
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    
    if (!currentQuiz) {
        console.error('Quiz type not found:', quizType);
        return;
    }
    
    // Show quiz modal
    const modal = new bootstrap.Modal(document.getElementById('quizModal'));
    modal.show();
    
    // Initialize first question
    displayQuestion();
    
    // Track quiz start
    if (window.EcoBeach) {
        window.EcoBeach.trackEvent('quiz', 'start', quizType);
    }
}

// Display current question
function displayQuestion() {
    const quizContent = document.getElementById('quizContent');
    const question = currentQuiz[currentQuestion];
    
    if (!question) {
        showQuizResults();
        return;
    }
    
    // Reset timer
    timeLeft = 30;
    updateTimer();
    startTimer();
    
    const progressPercent = ((currentQuestion + 1) / currentQuiz.length) * 100;
    
    quizContent.innerHTML = `
        <div class="quiz-header mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">Pergunta ${currentQuestion + 1} de ${currentQuiz.length}</h6>
                <div class="quiz-timer">
                    <i class="fas fa-clock me-1"></i>
                    <span id="timeDisplay">${timeLeft}s</span>
                </div>
            </div>
            <div class="progress mb-3">
                <div class="progress-bar bg-ocean" style="width: ${progressPercent}%"></div>
            </div>
        </div>
        
        <div class="quiz-question">
            <h5 class="mb-4">${question.question}</h5>
            
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <button class="btn btn-outline-primary quiz-option w-100 mb-2 text-start" 
                            onclick="selectAnswer(${index})" 
                            data-option="${index}">
                        <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                        ${option}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// Start countdown timer
function startTimer() {
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            // Auto-submit with no answer
            selectAnswer(-1);
        }
    }, 1000);
}

// Update timer display
function updateTimer() {
    const timerDisplay = document.getElementById('timeDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = `${timeLeft}s`;
        
        // Change color based on remaining time
        const timerElement = timerDisplay.parentElement;
        if (timeLeft <= 5) {
            timerElement.className = 'quiz-timer text-danger';
        } else if (timeLeft <= 10) {
            timerElement.className = 'quiz-timer text-warning';
        } else {
            timerElement.className = 'quiz-timer';
        }
    }
}

// Handle answer selection
function selectAnswer(answerIndex) {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    const question = currentQuiz[currentQuestion];
    const isCorrect = answerIndex === question.correct;
    
    // Store user answer
    userAnswers.push({
        questionIndex: currentQuestion,
        selectedAnswer: answerIndex,
        correct: isCorrect,
        timeUsed: 30 - timeLeft
    });
    
    if (isCorrect && answerIndex !== -1) {
        score++;
    }
    
    // Show answer feedback
    showAnswerFeedback(answerIndex, question);
}

// Show feedback for selected answer
function showAnswerFeedback(selectedIndex, question) {
    const options = document.querySelectorAll('.quiz-option');
    
    // Disable all options
    options.forEach(option => {
        option.disabled = true;
        const optionIndex = parseInt(option.getAttribute('data-option'));
        
        // Highlight correct answer
        if (optionIndex === question.correct) {
            option.classList.remove('btn-outline-primary');
            option.classList.add('btn-success');
            option.innerHTML += ' <i class="fas fa-check ms-2"></i>';
        }
        // Highlight wrong answer if selected
        else if (optionIndex === selectedIndex && selectedIndex !== question.correct) {
            option.classList.remove('btn-outline-primary');
            option.classList.add('btn-danger');
            option.innerHTML += ' <i class="fas fa-times ms-2"></i>';
        }
    });
    
    // Show explanation
    const quizContent = document.getElementById('quizContent');
    const explanationHTML = `
        <div class="quiz-explanation mt-4 p-3 bg-light rounded">
            <h6><i class="fas fa-lightbulb me-2"></i>Explicação:</h6>
            <p class="mb-0">${question.explanation}</p>
        </div>
        
        <div class="quiz-navigation mt-4 text-center">
            <button class="btn btn-ocean" onclick="nextQuestion()">
                ${currentQuestion < currentQuiz.length - 1 ? 'Próxima Pergunta' : 'Ver Resultados'}
                <i class="fas fa-arrow-right ms-2"></i>
            </button>
        </div>
    `;
    
    quizContent.innerHTML += explanationHTML;
    
    // Track answer
    if (window.EcoBeach) {
        window.EcoBeach.trackEvent('quiz', 'answer', 
            selectedIndex === question.correct ? 'correct' : 'incorrect');
    }
}

// Move to next question
function nextQuestion() {
    currentQuestion++;
    
    if (currentQuestion < currentQuiz.length) {
        displayQuestion();
    } else {
        showQuizResults();
    }
}

// Show final quiz results
function showQuizResults() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    const percentage = Math.round((score / currentQuiz.length) * 100);
    
    // Determine performance level
    let performanceLevel, performanceColor, performanceIcon, performanceMessage;
    
    if (percentage >= 80) {
        performanceLevel = 'Excelente!';
        performanceColor = 'success';
        performanceIcon = 'fa-trophy';
        performanceMessage = 'Você tem um conhecimento excepcional sobre a biodiversidade de Guriri!';
    } else if (percentage >= 60) {
        performanceLevel = 'Muito Bom!';
        performanceColor = 'primary';
        performanceIcon = 'fa-medal';
        performanceMessage = 'Parabéns! Você conhece bem nossa região. Continue explorando!';
    } else if (percentage >= 40) {
        performanceLevel = 'Bom Começo!';
        performanceColor = 'warning';
        performanceIcon = 'fa-star';
        performanceMessage = 'Você está no caminho certo. Explore mais nossa área educativa!';
    } else {
        performanceLevel = 'Continue Aprendendo!';
        performanceColor = 'info';
        performanceIcon = 'fa-book';
        performanceMessage = 'Há muito para descobrir sobre Guriri. Não desista!';
    }
    
    // Calculate average time per question
    const totalTime = userAnswers.reduce((sum, answer) => sum + answer.timeUsed, 0);
    const avgTime = Math.round(totalTime / userAnswers.length);
    
    const quizContent = document.getElementById('quizContent');
    quizContent.innerHTML = `
        <div class="quiz-results text-center">
            <div class="result-icon mb-4">
                <i class="fas ${performanceIcon} fa-4x text-${performanceColor}"></i>
            </div>
            
            <h3 class="text-${performanceColor} mb-3">${performanceLevel}</h3>
            
            <div class="score-display mb-4">
                <div class="score-circle mx-auto mb-3" style="
                    width: 120px; 
                    height: 120px; 
                    border-radius: 50%; 
                    background: conic-gradient(var(--ocean-blue) ${percentage * 3.6}deg, #e9ecef 0);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                ">
                    <div style="
                        width: 90px; 
                        height: 90px; 
                        background: white; 
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.5rem;
                        font-weight: bold;
                        color: var(--ocean-blue);
                    ">
                        ${percentage}%
                    </div>
                </div>
                
                <h4>${score} de ${currentQuiz.length} corretas</h4>
            </div>
            
            <div class="result-message mb-4">
                <p class="lead">${performanceMessage}</p>
            </div>
            
            <div class="quiz-stats mb-4">
                <div class="row">
                    <div class="col-6">
                        <div class="stat-item">
                            <i class="fas fa-clock text-info"></i>
                            <small class="d-block">Tempo Médio</small>
                            <strong>${avgTime}s por pergunta</strong>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stat-item">
                            <i class="fas fa-percentage text-success"></i>
                            <small class="d-block">Aproveitamento</small>
                            <strong>${percentage}%</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="quiz-actions">
                <button class="btn btn-ocean me-2" onclick="restartQuiz()">
                    <i class="fas fa-redo me-2"></i>Tentar Novamente
                </button>
                <button class="btn btn-outline-ocean" onclick="shareResults()">
                    <i class="fas fa-share me-2"></i>Compartilhar
                </button>
            </div>
            
            <div class="next-steps mt-4 p-3 bg-light rounded">
                <h6><i class="fas fa-compass me-2"></i>Próximos Passos:</h6>
                <div class="d-flex flex-wrap gap-2 justify-content-center">
                    <a href="/biodiversidade" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-leaf me-1"></i>Explorar Biodiversidade
                    </a>
                    <a href="/educativo" class="btn btn-sm btn-outline-success">
                        <i class="fas fa-graduation-cap me-1"></i>Materiais Educativos
                    </a>
                    <a href="/preserve" class="btn btn-sm btn-outline-warning">
                        <i class="fas fa-recycle me-1"></i>Ações Sustentáveis
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Send results to server
    submitQuizResults();
    
    // Track completion
    if (window.EcoBeach) {
        window.EcoBeach.trackEvent('quiz', 'complete', `${score}/${currentQuiz.length}`);
    }
}

// Submit quiz results to server
async function submitQuizResults() {
    const results = {
        score: score,
        total: currentQuiz.length,
        percentage: Math.round((score / currentQuiz.length) * 100),
        answers: userAnswers,
        completedAt: new Date().toISOString()
    };
    
    try {
        const response = await fetch('/api/quiz-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(results)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Quiz results submitted successfully:', data);
        }
    } catch (error) {
        console.error('Error submitting quiz results:', error);
    }
}

// Restart quiz
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    displayQuestion();
}

// Share results
function shareResults() {
    const percentage = Math.round((score / currentQuiz.length) * 100);
    const text = `Acabei de fazer o quiz do EcoBeach sobre a biodiversidade de Guriri! Acertei ${score} de ${currentQuiz.length} perguntas (${percentage}%). Teste seus conhecimentos também!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Quiz EcoBeach - Biodiversidade de Guriri',
            text: text,
            url: window.location.href
        });
    } else {
        // Fallback para navegadores sem Web Share API
        const shareText = encodeURIComponent(text + ' ' + window.location.href);
        const whatsappUrl = `https://wa.me/?text=${shareText}`;
        window.open(whatsappUrl, '_blank');
    }
    
    if (window.EcoBeach) {
        window.EcoBeach.trackEvent('quiz', 'share', percentage.toString());
    }
}

// Review answers
function reviewAnswers() {
    const reviewContent = userAnswers.map((answer, index) => {
        const question = currentQuiz[answer.questionIndex];
        const isCorrect = answer.correct;
        const selectedOption = answer.selectedAnswer >= 0 ? question.options[answer.selectedAnswer] : 'Não respondida';
        const correctOption = question.options[question.correct];
        
        return `
            <div class="review-item mb-4 p-3 border rounded ${isCorrect ? 'border-success' : 'border-danger'}">
                <div class="d-flex align-items-start">
                    <div class="me-3">
                        <i class="fas ${isCorrect ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'} fa-lg"></i>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-2">Pergunta ${index + 1}</h6>
                        <p class="mb-2">${question.question}</p>
                        
                        <div class="answers mb-2">
                            <small class="text-muted">Sua resposta:</small>
                            <div class="${isCorrect ? 'text-success' : 'text-danger'}">${selectedOption}</div>
                            
                            ${!isCorrect ? `
                                <small class="text-muted mt-1">Resposta correta:</small>
                                <div class="text-success">${correctOption}</div>
                            ` : ''}
                        </div>
                        
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>Tempo: ${answer.timeUsed}s
                        </small>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const quizContent = document.getElementById('quizContent');
    quizContent.innerHTML = `
        <div class="quiz-review">
            <div class="text-center mb-4">
                <h4><i class="fas fa-clipboard-list me-2"></i>Revisão das Respostas</h4>
                <p class="text-muted">Veja suas respostas e aprenda com os erros</p>
            </div>
            
            ${reviewContent}
            
            <div class="text-center mt-4">
                <button class="btn btn-ocean" onclick="showQuizResults()">
                    <i class="fas fa-arrow-left me-2"></i>Voltar aos Resultados
                </button>
            </div>
        </div>
    `;
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (currentQuiz && currentQuestion < currentQuiz.length) {
            // Use number keys 1-4 to select answers
            if (event.key >= '1' && event.key <= '4') {
                const answerIndex = parseInt(event.key) - 1;
                if (answerIndex < currentQuiz[currentQuestion].options.length) {
                    selectAnswer(answerIndex);
                }
            }
            
            // Use space or enter to continue
            if ((event.key === ' ' || event.key === 'Enter') && timer === null) {
                nextQuestion();
            }
        }
    });
});

// Export quiz functions
window.QuizApp = {
    startQuiz,
    selectAnswer,
    nextQuestion,
    restartQuiz,
    shareResults,
    reviewAnswers
};
