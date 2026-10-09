import React, { useState, useEffect } from 'react';

const Quiz = ({ user, quizData, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // initialize from quizData (contains first question)
    if (quizData) {
      setCurrentQuestion({ question: quizData.question, options: quizData.options });
      setQuestionNumber(quizData.current_question || 1);
    }
  }, [quizData]);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) {
      setError('Please select an answer');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/answer/${quizData.quiz_id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: selectedAnswer }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.completed) {
          // submit quiz to get results
          const submitResp = await fetch(`/api/submit/${quizData.quiz_id}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });

          const results = await submitResp.json();
          if (submitResp.ok) {
            onComplete({
              score: results.score,
              total_questions: results.total_questions,
              topic: quizData.topic,
              percentage: results.percentage,
              review: results.review,
            });
          } else {
            setError(results.error || 'Failed to get results');
          }
          return;
        }

        // set next question
        setCurrentQuestion({ question: data.question, options: data.options });
        setQuestionNumber(data.current_question || questionNumber + 1);
        setSelectedAnswer('');
      } else {
        setError(data.error || 'Failed to submit answer');
      }
    } catch (err) {
      setError('Connection error. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="quiz-container">
        <div className="loading">Preparing quiz...</div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Quiz: {quizData.topic}</h2>
        <div className="progress">
          Question {questionNumber} of {quizData.total_questions}
        </div>
      </div>

      <div className="question-container">
        <h3>{currentQuestion.question}</h3>

        {error && <div className="error-message">{error}</div>}

        <div className="options">
          {currentQuestion.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
            return (
              <label key={optionLetter} className="option">
                <input
                  type="radio"
                  name="answer"
                  value={optionLetter}
                  checked={selectedAnswer === optionLetter}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={loading}
                />
                <span className="option-letter">{optionLetter}.</span>
                <span className="option-text">{option}</span>
              </label>
            );
          })}
        </div>

        <button
          onClick={handleAnswerSubmit}
          disabled={loading || !selectedAnswer}
          className="submit-answer-btn"
        >
          {loading ? 'Submitting...' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
