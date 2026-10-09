import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Instructions from './components/Instructions';
import ExamInterface from './components/ExamInterface';
import Results from './components/Results';
import Analysis from './components/Analysis';

function App() {
  const [currentStep, setCurrentStep] = useState('login');
  const [user, setUser] = useState(null);
  const [examData, setExamData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('exam-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/current-user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setCurrentStep('instructions');
      }
    } catch (error) {
      console.log('Not logged in');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('exam-theme', newTheme);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentStep('instructions');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setUser(null);
      setCurrentStep('login');
      setExamData(null);
      setResults(null);
    }
  };

  const handleStartExam = (data) => {
    setExamData(data);
    setCurrentStep('exam');
  };

  const handleExamComplete = (resultData) => {
    setResults(resultData);
    setCurrentStep('results');
  };

  const handleViewAnalysis = () => {
    setCurrentStep('analysis');
  };

  const handleRetakeExam = () => {
    setCurrentStep('instructions');
    setExamData(null);
    setResults(null);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <div className="spinner"></div>
          Loading...
        </div>
      </div>
    );
  }

  const isExamMode = currentStep === 'exam';

  return (
    <div className={`App ${isExamMode ? 'exam-mode' : ''}`}>
      {currentStep === 'login' && (
        <Login onLogin={handleLogin} />
      )}
      {currentStep === 'instructions' && (
        <Instructions 
          user={user} 
          onStartExam={handleStartExam} 
          onLogout={handleLogout} 
        />
      )}
      {currentStep === 'exam' && (
        <ExamInterface 
          user={user} 
          examData={examData} 
          onComplete={handleExamComplete} 
        />
      )}
      {currentStep === 'results' && (
        <Results 
          results={results} 
          onViewAnalysis={handleViewAnalysis}
          onRetakeExam={handleRetakeExam}
          onLogout={handleLogout}
        />
      )}
      {currentStep === 'analysis' && (
        <Analysis 
          results={results}
          onBackToResults={() => setCurrentStep('results')}
          onRetakeExam={handleRetakeExam}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
