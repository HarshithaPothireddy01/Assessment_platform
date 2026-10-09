import React, { useState } from 'react';

const Instructions = ({ user, onStartExam, onLogout }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('exam-theme', newTheme);
  };

  const getCurrentTheme = () => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  };

  const handleStartExam = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for the assessment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/start-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, num_questions: numQuestions })
      });

      const data = await response.json();

      if (response.ok) {
        onStartExam({
          quiz_id: data.quiz_id,
          total_questions: data.total_questions,
          current_question: data.current_question,
          question: data.question,
          options: data.options,
          topic: topic.trim(),
        });
      } else {
        setError(data.error || 'Failed to start assessment');
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const ConfirmationModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Start Assessment</h2>
          <p className="modal-subtitle">Are you ready to begin?</p>
        </div>
        <div className="modal-body">
          <p>Once you start the assessment, the timer will begin and you cannot pause or restart.</p>
          <p><strong>Topic:</strong> {topic}</p>
          <p><strong>Questions:</strong> {numQuestions}</p>
          <p><strong>Duration:</strong> {numQuestions * 2} minutes</p>
        </div>
        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowConfirmModal(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleStartExam}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Starting...
              </>
            ) : (
              'Start Assessment'
            )}
          </button>
        </div>
      </div>
    </div>
  );

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

      <div className="instructions-container">
        <div className="instructions-card">
          <div className="instructions-header">
            <h1 className="instructions-title">Assessment Instructions</h1>
            <p className="instructions-subtitle">Please read all instructions carefully before starting</p>
          </div>

          <div className="instructions-content">
            <div className="instructions-section">
              <h3>General Instructions</h3>
              <ul className="instructions-list">
                <li>This is a timed assessment. Once started, the timer cannot be paused or stopped.</li>
                <li>You can navigate between questions using the question navigation panel.</li>
                <li>Each question has only one correct answer from the given options.</li>
                <li>You can mark questions for review and return to them later.</li>
                <li>Ensure you have a stable internet connection throughout the assessment.</li>
                <li>Do not refresh the browser or navigate away from this page during the exam.</li>
              </ul>
            </div>

            <div className="instructions-section">
              <h3>Navigation Guidelines</h3>
              <ul className="instructions-list">
                <li>Use "Save & Next" to save your answer and move to the next question.</li>
                <li>Use "Previous" to go back to the previous question.</li>
                <li>Use "Mark for Review" to flag questions you want to revisit.</li>
                <li>Click on question numbers in the navigation panel to jump to specific questions.</li>
                <li>Submit the test only when you have completed all questions.</li>
              </ul>
            </div>

            <div className="instructions-section">
              <h3>Question Status Legend</h3>
              <ul className="instructions-list">
                <li><strong>Answered:</strong> Questions you have answered</li>
                <li><strong>Not Answered:</strong> Questions you haven't attempted</li>
                <li><strong>Marked for Review:</strong> Questions flagged for later review</li>
                <li><strong>Current:</strong> The question you are currently viewing</li>
              </ul>
            </div>

            <div className="instructions-section">
              <h3>Assessment Configuration</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="topic">Assessment Topic</label>
                <input
                  type="text"
                  id="topic"
                  className="form-input"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., JavaScript, Data Structures, General Aptitude, etc."
                  disabled={loading}
                />
                <div className="form-hint">Enter the subject or topic you want to be assessed on</div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="numQuestions">Number of Questions</label>
                <select
                  id="numQuestions"
                  className="form-select"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  disabled={loading}
                >
                  <option value={5}>5 Questions (10 minutes)</option>
                  <option value={10}>10 Questions (20 minutes)</option>
                  <option value={15}>15 Questions (30 minutes)</option>
                  <option value={20}>20 Questions (40 minutes)</option>
                  <option value={25}>25 Questions (50 minutes)</option>
                  <option value={30}>30 Questions (60 minutes)</option>
                </select>
              </div>
            </div>

            <div className="exam-info-grid">
              <div className="exam-info-item">
                <span className="exam-info-value">{numQuestions}</span>
                <div className="exam-info-label">Total Questions</div>
              </div>
              <div className="exam-info-item">
                <span className="exam-info-value">{numQuestions * 2}</span>
                <div className="exam-info-label">Minutes</div>
              </div>
              <div className="exam-info-item">
                <span className="exam-info-value">1</span>
                <div className="exam-info-label">Attempt</div>
              </div>
              <div className="exam-info-item">
                <span className="exam-info-value">MCQ</span>
                <div className="exam-info-label">Question Type</div>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="instructions-section">
              <h3>Important Notes</h3>
              <ul className="instructions-list">
                <li>Make sure you are in a quiet environment with minimal distractions.</li>
                <li>Keep your device charged or connected to power during the assessment.</li>
                <li>Close all unnecessary applications and browser tabs.</li>
                <li>You will receive your results immediately after submission.</li>
                <li>Detailed analysis will be available after completing the assessment.</li>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center', paddingTop: '24px', borderTop: '2px solid var(--border-light)' }}>
            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
              By clicking "Start Assessment", you agree to the terms and conditions of this assessment.
            </p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setShowConfirmModal(true)}
              disabled={loading || !topic.trim()}
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && <ConfirmationModal />}
    </>
  );
};

export default Instructions;
