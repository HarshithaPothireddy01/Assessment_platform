
import React, { useState, useEffect, useCallback } from 'react';

const ExamInterface = ({ user, examData, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(examData.total_questions * 2 * 60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);

  useEffect(() => {
    if (examData && examData.question) {
      setCurrentQuestion({
        question: examData.question,
        options: examData.options,
      });
      setQuestionNumber(examData.current_question);

      const savedAnswer = answers[examData.current_question];
      setSelectedAnswer(savedAnswer || '');
    }
  }, [examData, answers]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setShowTimeUpModal(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const saveCurrentAnswer = useCallback(() => {
    if (selectedAnswer) {
      setAnswers((prev) => ({
        ...prev,
        [questionNumber]: selectedAnswer,
      }));
    }
  }, [selectedAnswer, questionNumber]);

  const navigateToQuestion = async (targetQuestion) => {
    if (targetQuestion === questionNumber) return;

    saveCurrentAnswer();
    setLoading(true);
    setError('');

    try {
      // Submit the current answer before moving to the next question.
      if (targetQuestion === questionNumber + 1 && selectedAnswer) {
        const response = await fetch(
          `/api/answer/${examData.quiz_id}`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answer: selectedAnswer }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to submit answer');
          return;
        }

        if (data.completed) {
          // The answer was saved before the quiz was completed.
          await handleExamSubmit(false);
          return;
        }

        setCurrentQuestion({
          question: data.question,
          options: data.options,
        });
        setQuestionNumber(data.current_question);
        setSelectedAnswer(answers[data.current_question] || '');
      } else {
        // Preserve the existing question-navigation behavior.
        setQuestionNumber(targetQuestion);
        setSelectedAnswer(answers[targetQuestion] || '');
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = () => {
    if (!selectedAnswer) {
      setError('Please select an answer before proceeding');
      return;
    }

    navigateToQuestion(questionNumber + 1);
  };

  const handlePrevious = () => {
    if (questionNumber > 1) {
      saveCurrentAnswer();
      setQuestionNumber(questionNumber - 1);
      setSelectedAnswer(answers[questionNumber - 1] || '');
    }
  };

  const handleMarkForReview = () => {
    const newMarked = new Set(markedForReview);

    if (newMarked.has(questionNumber)) {
      newMarked.delete(questionNumber);
    } else {
      newMarked.add(questionNumber);
    }

    setMarkedForReview(newMarked);

    if (selectedAnswer) {
      saveCurrentAnswer();
    }

    if (questionNumber < examData.total_questions) {
      navigateToQuestion(questionNumber + 1);
    }
  };

  // Submit the final answer first, then calculate the quiz score.
  // Pass false only when the answer has already been submitted.
  const handleExamSubmit = useCallback(
    async (submitCurrentAnswer = true) => {
      if (loading) return;

      setLoading(true);
      setError('');

      try {
        if (
          submitCurrentAnswer &&
          questionNumber === examData.total_questions &&
          selectedAnswer
        ) {
          const answerResponse = await fetch(
            `/api/answer/${examData.quiz_id}`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ answer: selectedAnswer }),
            }
          );

          const answerData = await answerResponse.json();

          if (!answerResponse.ok) {
            setError(
              answerData.error || 'Failed to save the last answer'
            );
            return;
          }

          // Keep the local answer state up to date.
          setAnswers((prev) => ({
            ...prev,
            [questionNumber]: selectedAnswer,
          }));
        }

        // This request runs only after the final answer request succeeds.
        const response = await fetch(
          `/api/submit/${examData.quiz_id}`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          onComplete({
            score: data.score,
            total_questions: data.total_questions,
            percentage: data.percentage,
            topic: examData.topic,
            review: data.review,
            email_sent: data.email_sent,
          });
        } else {
          setError(data.error || 'Failed to submit assessment');
        }
      } catch (err) {
        setError('Connection error. Please check your internet connection.');
      } finally {
        setLoading(false);
        setShowSubmitModal(false);
      }
    },
    [
      loading,
      questionNumber,
      examData.total_questions,
      examData.quiz_id,
      examData.topic,
      selectedAnswer,
      onComplete,
    ]
  );

  const handleAutoSubmit = useCallback(() => {
    handleExamSubmit();
  }, [handleExamSubmit]);

  // Auto-submit when time is up.
  useEffect(() => {
    if (timeLeft === 0 && !showTimeUpModal) {
      handleAutoSubmit();
    }
  }, [timeLeft, showTimeUpModal, handleAutoSubmit]);

  const getQuestionStatus = (qNum) => {
    if (qNum === questionNumber) return 'current';
    if (answers[qNum]) return 'answered';
    if (markedForReview.has(qNum)) return 'marked';
    return 'unanswered';
  };

  const getAnsweredCount = () => {
    const savedAnswers = Object.keys(answers).length;
    const hasCurrentAnswer =
      selectedAnswer && !answers[questionNumber];

    return savedAnswers + (hasCurrentAnswer ? 1 : 0);
  };

  const getMarkedCount = () => markedForReview.size;

  const getUnansweredCount = () =>
    examData.total_questions - getAnsweredCount();

  // Submit confirmation modal.
  const SubmitModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Submit Assessment</h2>
          <p className="modal-subtitle">
            Are you sure you want to submit?
          </p>
        </div>

        <div className="modal-body">
          <p>
            Once submitted, you cannot make any changes to your answers.
          </p>

          <div
            style={{
              margin: '16px 0',
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
            }}
          >
            <p>
              <strong>Answered:</strong> {getAnsweredCount()} questions
            </p>
            <p>
              <strong>Marked for Review:</strong> {getMarkedCount()} questions
            </p>
            <p>
              <strong>Not Answered:</strong> {getUnansweredCount()} questions
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowSubmitModal(false)}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={() => handleExamSubmit()}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Submitting...
              </>
            ) : (
              'Submit Assessment'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Time-up modal.
  const TimeUpModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Time's Up!</h2>
          <p className="modal-subtitle">
            Your assessment time has expired
          </p>
        </div>

        <div className="modal-body">
          <p>
            The assessment will be automatically submitted with your
            current answers.
          </p>
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-primary"
            onClick={handleAutoSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Submitting...
              </>
            ) : (
              'Submit Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (!currentQuestion) {
    return (
      <div className="exam-container">
        <div className="loading">
          <div className="spinner"></div>
          Loading question...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="exam-header">
        <div className="exam-logo">
          <div className="logo-icon">AP</div>
          <h1>Assessment Portal</h1>
        </div>

        <div
          className={`exam-timer ${timeLeft < 300 ? 'warning' : ''}`}
        >
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="exam-container">
        <div className="exam-sidebar">
          <div className="question-navigation">
            <h3 className="nav-title">Question Navigation</h3>

            <div className="question-grid">
              {Array.from(
                { length: examData.total_questions },
                (_, i) => i + 1
              ).map((qNum) => (
                <button
                  key={qNum}
                  className={`question-nav-btn ${getQuestionStatus(qNum)}`}
                  onClick={() => navigateToQuestion(qNum)}
                  disabled={loading}
                >
                  {qNum}
                </button>
              ))}
            </div>

            <div className="nav-legend">
              <div className="legend-item">
                <div className="legend-color answered"></div>
                <span>Answered ({getAnsweredCount()})</span>
              </div>

              <div className="legend-item">
                <div className="legend-color unanswered"></div>
                <span>Not Answered ({getUnansweredCount()})</span>
              </div>

              <div className="legend-item">
                <div className="legend-color marked"></div>
                <span>Marked for Review ({getMarkedCount()})</span>
              </div>

              <div className="legend-item">
                <div className="legend-color current"></div>
                <span>Current Question</span>
              </div>
            </div>
          </div>
        </div>

        <div className="exam-main">
          <div className="question-content">
            <div className="question-header">
              <div className="question-info">
                Question {questionNumber} of {examData.total_questions} |
                {' '}Topic: {examData.topic}
              </div>
            </div>

            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            <div className="question-text">
              {currentQuestion.question}
            </div>

            <div className="options-container">
              {currentQuestion.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);

                return (
                  <div
                    key={optionLetter}
                    className={`option-item ${
                      selectedAnswer === optionLetter ? 'selected' : ''
                    }`}
                    onClick={() =>
                      !loading && setSelectedAnswer(optionLetter)
                    }
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={optionLetter}
                      checked={selectedAnswer === optionLetter}
                      onChange={(e) =>
                        setSelectedAnswer(e.target.value)
                      }
                      disabled={loading}
                      className="option-radio"
                    />

                    <span className="option-label">
                      {optionLetter}.
                    </span>
                    <span className="option-text">{option}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="exam-controls">
            <div className="control-group">
              <button
                className={`mark-review-btn ${
                  markedForReview.has(questionNumber) ? 'marked' : ''
                }`}
                onClick={handleMarkForReview}
                disabled={loading}
              >
                {markedForReview.has(questionNumber)
                  ? 'Unmark Review'
                  : 'Mark for Review'}
              </button>
            </div>

            <div className="control-group">
              <button
                className="btn btn-secondary"
                onClick={handlePrevious}
                disabled={loading || questionNumber === 1}
              >
                Previous
              </button>

              {questionNumber < examData.total_questions ? (
                <button
                  className="btn btn-primary"
                  onClick={handleSaveAndNext}
                  disabled={loading}
                >
                  Save & Next
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={loading}
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSubmitModal && <SubmitModal />}
      {showTimeUpModal && <TimeUpModal />}
    </>
  );
};

export default ExamInterface;