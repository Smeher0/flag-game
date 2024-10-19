'use client';

import { useState, useEffect } from 'react';
import styles from './quiz.module.css';

export default function Home() {
  const [quizData, setQuizData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [timeLimit, setTimeLimit] = useState(10);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const [options, setOptions] = useState([]);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // Fetch the quiz data from the API
  useEffect(() => {
    async function fetchQuizData() {
      const response = await fetch('/api/quiz');
      const data = await response.json();
      setQuizData(data.sheet1.map(item => ({
        continent: item.continent,
        country: item.country,
        url: item.url,
        capital: item.capital,
        currency: item.currency
      })));
    }
    fetchQuizData();
  }, []);

  useEffect(() => {
    if (isQuizActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && isQuizActive) {
      checkAnswer(''); // Trigger wrong answer if time runs out
    }
  }, [timer, isQuizActive]);

  const startQuiz = () => {
    setIsQuizActive(true);
    nextQuestion();
  };

  const nextQuestion = () => {
    setShowCorrectAnswer(false); // Reset the state for the next question
    if (currentQuestion >= totalQuestions) {
      setIsQuizActive(false);
      return;
    }

    const randomData = quizData[Math.floor(Math.random() * quizData.length)];
    setQuestionData(randomData);
    generateOptions(randomData);
    setCurrentQuestion(currentQuestion + 1);
    setAttempts(attempts + 1);
    setTimer(timeLimit);
  };

  const generateOptions = (data) => {
    const questionTypes = [
      { type: 'continent', text: 'Which continent does this flag belong to?' },
      { type: 'country', text: 'Which country does this flag belong to?' },
      { type: 'capital', text: 'What is the capital of this country?' },
      { type: 'currency', text: 'What is the currency of this country?' },
      { type: 'president_or_head', text: 'Who is the President or head of the country?'},
      { type: 'president_or_head', text: 'Who is the President or head of the country?'}
    ];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let allOptions = quizData.map(item => item[questionType.type]);
    allOptions = [...new Set(allOptions)]; // Remove duplicates

    const correctAnswer = data[questionType.type];
    let incorrectOptions = allOptions.filter(option => option !== correctAnswer);
    const shuffledOptions = incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalOptions = [...shuffledOptions, correctAnswer].sort(() => 0.5 - Math.random());

    setOptions({ question: questionType.text, choices: finalOptions, correctAnswer });
  };

  const checkAnswer = (selectedAnswer) => {
    if (!questionData) return;

    let isCorrect = selectedAnswer === options.correctAnswer;

    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      setScore(score + 1);
      nextQuestion();
    } else {
      setIncorrectAnswers(incorrectAnswers + 1);
      setScore(score - 0.25);

      // Show the correct answer for 3 seconds before moving to the next question
      setShowCorrectAnswer(true);
      setTimeout(() => {
        nextQuestion();
      }, 3000);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setAttempts(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setIsQuizActive(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Flag Master</h1>

      {!isQuizActive ? (
        <div className={styles.settings}>
          <label htmlFor="numQuestions">Number of Questions (Max 500): </label>
          <input
            type="number"
            id="numQuestions"
            className={styles.input}
            min="1"
            max="500"
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
          /><br /><br />

          <label htmlFor="timeLimit">Time per Question: </label>
          <select
            id="timeLimit"
            className={styles.select}
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
          >
            <option value="5">5 seconds</option>
            <option value="10">10 seconds</option>
            <option value="20">20 seconds</option>
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
          </select><br /><br />

          <button className={styles.startButton} onClick={startQuiz}>Start Quiz</button>
        </div>
      ) : (
        <div id="quiz" className={styles.quiz}>
          <h2 id="question" className={styles.question}>
            {`Question ${currentQuestion} of ${totalQuestions}: ${options.question}`}
          </h2>
          {questionData && (
            <div>
              <img src={questionData.url} alt="Country Flag" className={styles.flag} />
              <div id="options" className={styles.options}>
                {options.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => checkAnswer(choice)}
                    className={`
                      ${styles.optionButton}
                      ${showCorrectAnswer && choice === options.correctAnswer ? styles.correct : ''}
                    `}
                    disabled={showCorrectAnswer} // Disable buttons while showing correct answer
                  >
                    {choice}
                  </button>
                ))}
              </div>
              <div id="timer" className={styles.timer}>
                Time left: {timer}s
              </div>
              {showCorrectAnswer && (
                <p className={styles.correctAnswer}>
                  Correct Answer: {options.correctAnswer}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!isQuizActive && currentQuestion > 0 && (
        <div id="results" className={styles.results}>
          <h2>Quiz Results</h2>
          <p>Total Attempts: {attempts}</p>
          <p>Correct Answers: {correctAnswers}</p>
          <p>Incorrect Answers: {incorrectAnswers}</p>
          <p>Your Score: {score.toFixed(2)}</p>
          <button className={styles.restartButton} onClick={restartQuiz}>Restart Quiz</button>
        </div>
      )}
    </div>
  );
}
