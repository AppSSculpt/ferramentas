const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1ebYAU47RodolyQAie65zxh9VFWbqMGEjt6iSQRxsbY4/gviz/tq?tqx=out:json";

let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let answeredQuestions = []; // Armazenar o estado das respostas

document.getElementById("start").addEventListener("click", startQuiz);

async function startQuiz() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("quiz").style.display = "block";
    await fetchQuestions();
}

async function fetchQuestions() {
    const response = await fetch(spreadsheetUrl);
    const text = await response.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));

    json.table.rows.forEach(row => {
        questions.push({
            category: row.c[1]?.v || "",
            question: row.c[2]?.v || "",
            options: [
                row.c[3]?.v || "",
                row.c[4]?.v || "",
                row.c[5]?.v || "",
                row.c[6]?.v || ""
            ],
            correct: parseInt(row.c[7]?.v) || 0
        });
    });

    document.getElementById("total").innerText = questions.length;
    renderQuestion();
}

function renderQuestion() {
    const quiz = document.getElementById("quiz");
    const questionElem = document.getElementById("question");
    const optionsElem = document.getElementById("options");
    const currentElem = document.getElementById("current");

    if (currentQuestionIndex >= questions.length) {
        quiz.style.display = "none";
        document.getElementById("result").style.display = "block";
        document.getElementById("result").innerText = `Fim do Quiz! Você acertou ${correctAnswers} de ${questions.length} perguntas.`;
        document.getElementById("retry").style.display = "inline-block"; // Mostrar botão de refazer
        document.getElementById("next").style.display = "none"; // Esconder o botão de próxima pergunta
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    questionElem.innerText = currentQuestion.question;
    currentElem.innerText = currentQuestionIndex + 1;
    optionsElem.innerHTML = "";

    currentQuestion.options.forEach((option, index) => {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.innerText = `${String.fromCharCode(65 + index)} - ${option}`;
        
        // Se a questão já foi respondida, aplicar as cores corretas
        if (answeredQuestions[currentQuestionIndex] !== undefined) {
            const isCorrect = answeredQuestions[currentQuestionIndex] === index + 1;
            const isWrong = answeredQuestions[currentQuestionIndex] !== currentQuestion.correct;
            if (isCorrect) {
                button.classList.add("correct");
            } else if (isWrong) {
                button.classList.add("wrong");
            }
        }

        button.addEventListener("click", () => checkAnswer(index + 1));
        li.appendChild(button);
        optionsElem.appendChild(li);
    });

    document.getElementById("back").style.display = currentQuestionIndex > 0 ? "inline-block" : "none";

    // Esconder "Próxima" e mostrar "Ver Resultado" na última questão
    if (currentQuestionIndex === questions.length - 1) {
        document.getElementById("next").style.display = "none"; // Esconder o botão "Próxima"
        document.getElementById("skip").style.display = "none"; // Esconder o botão "Pular"
        document.getElementById("finish").style.display = "inline-block"; // Exibir "Finalizar Quiz"
    } else {
        document.getElementById("next").style.display = "inline-block"; // Exibir o botão "Próxima"
        document.getElementById("finish").style.display = "none"; // Esconder "Finalizar"
    }

    document.getElementById("feedback").style.display = "none";
}

function checkAnswer(selectedIndex) {
    const currentQuestion = questions[currentQuestionIndex];
    const correctOption = currentQuestion.correct;
    const feedbackElem = document.getElementById("feedback");

    // Salvar a resposta do usuário
    answeredQuestions[currentQuestionIndex] = selectedIndex;

    // Destacar as alternativas
    const optionsButtons = document.querySelectorAll("#options button");
    optionsButtons.forEach((button, index) => {
        if (index + 1 === correctOption) {
            button.classList.add("correct");
        } else {
            button.classList.add("wrong");
        }
    });

    if (selectedIndex === correctOption) {
        feedbackElem.className = "feedback correct";
        feedbackElem.innerText = "Resposta correta! 🎉";
        correctAnswers++;
    } else {
        feedbackElem.className = "feedback wrong";
        feedbackElem.innerText = `Resposta errada! ❌ A correta era: ${String.fromCharCode(65 + correctOption - 1)} - ${currentQuestion.options[correctOption - 1]}`;
    }

    feedbackElem.style.display = "block";
    setTimeout(() => feedbackElem.style.display = "none", 4000);

    document.getElementById("next").style.display = "inline-block";
}

document.getElementById("next").addEventListener("click", () => {
    currentQuestionIndex++;
    renderQuestion();
});

document.getElementById("back").addEventListener("click", () => {
    currentQuestionIndex--;
    renderQuestion();
});

document.getElementById("skip").addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        renderQuestion();
    } else {
        document.getElementById("quiz").style.display = "none";
        document.getElementById("result").style.display = "block";
        document.getElementById("result").innerText = `Fim do Quiz! Você acertou ${correctAnswers} de ${questions.length} perguntas.`;
        document.getElementById("retry").style.display = "inline-block"; // Exibir botão de refazer
        document.getElementById("finish").style.display = "none"; // Esconder "Finalizar"
    }
});

// Função de refazer o quiz
document.getElementById("retry").addEventListener("click", () => {
    correctAnswers = 0;  // Resetar a pontuação
    currentQuestionIndex = 0;  // Reiniciar a index da pergunta
    answeredQuestions = []; // Limpar as respostas anteriores
    document.getElementById("result").style.display = "none";  // Esconder o resultado
    document.getElementById("quiz").style.display = "block";  // Mostrar a tela do quiz
    renderQuestion();  // Recarregar a primeira pergunta
    document.getElementById("retry").style.display = "none";  // Esconder o botão de refazer até o fim do quiz
});

document.getElementById("finish").addEventListener("click", () => {
    document.getElementById("quiz").style.display = "none";
    document.getElementById("result").style.display = "block";
    document.getElementById("result").innerText = `Fim do Quiz! Você acertou ${correctAnswers} de ${questions.length} perguntas.`;
    document.getElementById("retry").style.display = "inline-block"; // Mostrar botão de refazer
});
