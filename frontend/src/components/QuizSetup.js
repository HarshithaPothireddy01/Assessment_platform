import React, { useState } from 'react';

const QuizSetup = ({ user, onQuizStart }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/start-quiz`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          num_questions: numQuestions,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // pass full quiz payload (first question included)
        onQuizStart({
          quiz_id: data.quiz_id,
          total_questions: data.total_questions,
          topic,
          current_question: data.current_question,
          question: data.question,
          options: data.options,
        });
      } else {
        const errorData = await response.json();
        setError(data.error || 'Failed to start quiz');
      }
    } catch (err) {
      setError('Connection error. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-setup-container">
      <div className="quiz-setup-form">
        <h2>Welcome, {user.name}!</h2>
        <h3>Setup Your Quiz</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="topic">Quiz Topic:</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., JavaScript, Python, History, Science"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="numQuestions">Number of Questions:</label>
            <select
              id="numQuestions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              disabled={loading}
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>
          
          <button type="submit" disabled={loading || !topic.trim()}>
            {loading ? 'Generating Quiz...' : 'Start Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizSetup;
