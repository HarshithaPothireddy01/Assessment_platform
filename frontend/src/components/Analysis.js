import React, { useState } from 'react';

const Analysis = ({ results, onBackToResults, onRetakeExam, onLogout }) => {
  const [filter, setFilter] = useState('all'); // all, correct, incorrect, unanswered

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('exam-theme', newTheme);
  };

  const getCurrentTheme = () => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  };

  const getOptionLetter = (index) => String.fromCharCode(65 + index);

  const filteredQuestions = results.review.filter(item => {
    if (filter === 'correct') return item.is_correct;
    if (filter === 'incorrect') return !item.is_correct && item.your_answer !== 'No answer';
    if (filter === 'unanswered') return item.your_answer === 'No answer';
    return true;
  });

  const getQuestionStats = () => {
    const correct = results.review.filter(item => item.is_correct).length;
    const incorrect = results.review.filter(item => !item.is_correct && item.your_answer !== 'No answer').length;
    const unanswered = results.review.filter(item => item.your_answer === 'No answer').length;
    
    return { correct, incorrect, unanswered };
  };

  const stats = getQuestionStats();

  return (
    <>
      <div className="exam-header">
        <div className="exam-logo">
          <div className="logo-icon">AP</div>
          <h1>Assessment Portal</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
            <span style={{ marginRight: '6px' }}>
              {getCurrentTheme() === 'light' ? '🌙' : '☀️'}
            </span>
            {getCurrentTheme() === 'light' ? 'Dark' : 'Light'}
          </button>
          <button onClick={onLogout} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </div>
      </div>

      <div className="results-container">
        <div className="analysis-container">
          <div className="analysis-header">
            <div>
              <h1 className="analysis-title">Detailed Analysis</h1>
              <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>
                Review your performance and learn from each question
              </p>
            </div>
            <div className="analysis-filters">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({results.review.length})
              </button>
              <button 
                className={`filter-btn ${filter === 'correct' ? 'active' : ''}`}
                onClick={() => setFilter('correct')}
              >
                Correct ({stats.correct})
              </button>
              <button 
                className={`filter-btn ${filter === 'incorrect' ? 'active' : ''}`}
                onClick={() => setFilter('incorrect')}
              >
                Incorrect ({stats.incorrect})
              </button>
              {stats.unanswered > 0 && (
                <button 
                  className={`filter-btn ${filter === 'unanswered' ? 'active' : ''}`}
                  onClick={() => setFilter('unanswered')}
                >
                  Unanswered ({stats.unanswered})
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div className="results-stats">
              <div className="stat-card">
                <span className="stat-value" style={{ color: 'var(--success)' }}>
                  {stats.correct}
                </span>
                <div className="stat-label">Correct</div>
              </div>
              
              <div className="stat-card">
                <span className="stat-value" style={{ color: 'var(--error)' }}>
                  {stats.incorrect}
                </span>
                <div className="stat-label">Incorrect</div>
              </div>
              
              {stats.unanswered > 0 && (
                <div className="stat-card">
                  <span className="stat-value" style={{ color: 'var(--text-muted)' }}>
                    {stats.unanswered}
                  </span>
                  <div className="stat-label">Unanswered</div>
                </div>
              )}
              
              <div className="stat-card">
                <span className="stat-value" style={{ color: 'var(--primary-blue)' }}>
                  {Math.round((results.score / results.total_questions) * 100)}%
                </span>
                <div className="stat-label">Accuracy</div>
              </div>
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--text-secondary)',
              background: 'var(--bg-tertiary)',
              borderRadius: '12px'
            }}>
              <h3>No questions found for the selected filter</h3>
              <p>Try selecting a different filter to view questions.</p>
            </div>
          ) : (
            filteredQuestions.map((item, index) => {
              const originalIndex = results.review.indexOf(item);
              const questionStatus = item.is_correct ? 'correct' : 
                                   item.your_answer === 'No answer' ? 'unanswered' : 'incorrect';
              
              return (
                <div key={originalIndex} className={`question-analysis ${questionStatus}`}>
                  <div className="analysis-question-header">
                    <div className="question-number">
                      Question {originalIndex + 1}
                    </div>
                    <div className={`question-status ${questionStatus}`}>
                      {questionStatus === 'correct' && '✓ Correct'}
                      {questionStatus === 'incorrect' && '✗ Incorrect'}
                      {questionStatus === 'unanswered' && '— Unanswered'}
                    </div>
                  </div>
                  
                  <div className="analysis-question-content">
                    <div className="analysis-question-text">
                      {item.question}
                    </div>
                    
                    <div className="analysis-options">
                      {item.options.map((option, optIndex) => {
                        const letter = getOptionLetter(optIndex);
                        const isUserAnswer = letter === item.your_answer;
                        const isCorrectAnswer = letter === item.correct_answer;
                        
                        let optionClass = 'analysis-option';
                        if (isCorrectAnswer) {
                          optionClass += ' correct-answer';
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          optionClass += ' user-answer';
                        } else if (isUserAnswer && isCorrectAnswer) {
                          optionClass += ' user-correct';
                        }
                        
                        return (
                          <div key={letter} className={optionClass}>
                            <span className="option-label">{letter}.</span>
                            <span className="option-text">{option}</span>
                            {isUserAnswer && (
                              <span style={{ 
                                marginLeft: 'auto', 
                                fontSize: '12px', 
                                fontWeight: '500',
                                color: isCorrectAnswer ? 'var(--success)' : 'var(--error)'
                              }}>
                                Your Answer
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span style={{ 
                                marginLeft: isUserAnswer ? '8px' : 'auto', 
                                fontSize: '12px', 
                                fontWeight: '500',
                                color: 'var(--success)'
                              }}>
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="analysis-summary">
                      <div className="user-answer-text">
                        <strong>Your Answer:</strong> {item.your_answer || 'Not answered'}
                      </div>
                      <div className="correct-answer-text">
                        <strong>Correct Answer:</strong> {item.correct_answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center', 
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '2px solid var(--border-light)'
          }}>
            <button 
              onClick={onBackToResults} 
              className="btn btn-secondary btn-lg"
            >
              Back to Results
            </button>
            <button 
              onClick={onRetakeExam} 
              className="btn btn-primary btn-lg"
            >
              Take Another Assessment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analysis;