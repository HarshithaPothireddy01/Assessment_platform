import React from 'react';

const Results = ({ results, onViewAnalysis, onRetakeExam, onLogout }) => {
  const percentage = results.percentage || Math.round((results.score / results.total_questions) * 100);
  
  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('exam-theme', newTheme);
  };

  const getCurrentTheme = () => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  };
  
  const getPerformanceLevel = () => {
    if (percentage >= 90) return { level: 'Excellent', color: 'var(--success)', message: 'Outstanding performance!' };
    if (percentage >= 80) return { level: 'Very Good', color: 'var(--success)', message: 'Great job! Well done.' };
    if (percentage >= 70) return { level: 'Good', color: 'var(--info)', message: 'Good performance. Keep it up!' };
    if (percentage >= 60) return { level: 'Average', color: 'var(--warning)', message: 'Average performance. Room for improvement.' };
    if (percentage >= 50) return { level: 'Below Average', color: 'var(--warning)', message: 'Below average. Consider more practice.' };
    return { level: 'Poor', color: 'var(--error)', message: 'Needs significant improvement.' };
  };

  const performance = getPerformanceLevel();

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
        <div className="results-header">
          <h1 className="results-title">Assessment Completed</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '0' }}>
            Your assessment has been successfully submitted and evaluated
          </p>
          
          <div className="score-display">
            <div 
              className="score-circle"
              style={{ borderColor: performance.color }}
            >
              <div className="score-number" style={{ color: performance.color }}>
                {results.score}/{results.total_questions}
              </div>
              <div className="score-percentage" style={{ color: performance.color }}>
                {percentage}%
              </div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ color: performance.color, marginBottom: '8px' }}>
                {performance.level}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {performance.message}
              </p>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Assessment Topic: <strong>{results.topic}</strong>
              </div>
            </div>
          </div>

          {results.email_sent && (
            <div className="alert alert-info" style={{ marginTop: '24px' }}>
              📧 Detailed results have been sent to your registered email address
            </div>
          )}
        </div>

        <div className="results-stats">
          <div className="stat-card">
            <span className="stat-value" style={{ color: 'var(--success)' }}>
              {results.score}
            </span>
            <div className="stat-label">Correct Answers</div>
          </div>
          
          <div className="stat-card">
            <span className="stat-value" style={{ color: 'var(--error)' }}>
              {results.total_questions - results.score}
            </span>
            <div className="stat-label">Incorrect Answers</div>
          </div>
          
          <div className="stat-card">
            <span className="stat-value" style={{ color: 'var(--primary-blue)' }}>
              {results.total_questions}
            </span>
            <div className="stat-label">Total Questions</div>
          </div>
          
          <div className="stat-card">
            <span className="stat-value" style={{ color: performance.color }}>
              {percentage}%
            </span>
            <div className="stat-label">Overall Score</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
          <button 
            onClick={onViewAnalysis} 
            className="btn btn-primary btn-lg"
          >
            View Detailed Analysis
          </button>
          <button 
            onClick={onRetakeExam} 
            className="btn btn-secondary btn-lg"
          >
            Take Another Assessment
          </button>
        </div>
      </div>
    </>
  );
};

export default Results;