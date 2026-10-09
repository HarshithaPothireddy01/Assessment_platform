import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: ''
  });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset password state
  const [resetData, setResetData] = useState({
    new_password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('exam-theme', newTheme);
  };

  const getCurrentTheme = () => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: loginData.email, 
          password: loginData.password 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/signup`, {
        method: 'POST',
        credentials: 'include',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          phone: signupData.phone,
          age: signupData.age,
          gender: signupData.gender
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Please login with your credentials.');
        setIsLogin(true);
        setSignupData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          age: '',
          gender: ''
        });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (response.ok && data.email_exists) {
        setResetEmail(forgotEmail);
        setIsForgotPassword(false);
        setIsResetPassword(true);
        setSuccess('Email verified. You can now reset your password.');
      } else {
        setError(data.message || 'Email not found in our records');
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (resetData.new_password !== resetData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetEmail,
          new_password: resetData.new_password,
          confirm_password: resetData.confirm_password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successful! You can now login with your new password.');
        setIsResetPassword(false);
        setIsLogin(true);
        setResetData({ new_password: '', confirm_password: '' });
        setResetEmail('');
      } else {
        setError(data.error || 'Password reset failed');
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setIsLogin(true);
    setIsForgotPassword(false);
    setIsResetPassword(false);
    setError('');
    setSuccess('');
  };

  if (isForgotPassword) {
    return (
      <div className="auth-container">
        {/* Theme Toggle for Login Pages */}
        <button 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--bg-primary)',
            border: '2px solid var(--border-light)',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-secondary)',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1001,
            minWidth: '100px',
            justifyContent: 'center'
          }}
          onClick={toggleTheme}
        >
          <span style={{ marginRight: '6px' }}>
            {getCurrentTheme() === 'light' ? '🌙' : '☀️'}
          </span>
          {getCurrentTheme() === 'light' ? 'Dark' : 'Light'}
        </button>
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">AP</div>
            <h1 className="auth-title">Password Recovery</h1>
            <p className="auth-subtitle">Enter your registered email address to reset your password</p>
          </div>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleForgotPasswordSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="forgotEmail">Email Address</label>
              <input
                type="email"
                id="forgotEmail"
                className="form-input"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Verifying Email...
                </>
              ) : (
                'Verify Email Address'
              )}
            </button>
          </form>

          <div className="auth-links">
            <button type="button" onClick={resetToLogin} className="link-btn">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isResetPassword) {
    return (
      <div className="auth-container">
        {/* Theme Toggle for Login Pages */}
        <button 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--bg-primary)',
            border: '2px solid var(--border-light)',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-secondary)',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1001,
            minWidth: '100px',
            justifyContent: 'center'
          }}
          onClick={toggleTheme}
        >
          <span style={{ marginRight: '6px' }}>
            {getCurrentTheme() === 'light' ? '🌙' : '☀️'}
          </span>
          {getCurrentTheme() === 'light' ? 'Dark' : 'Light'}
        </button>
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">AP</div>
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">Create a new password for {resetEmail}</p>
          </div>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleResetPasswordSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                className="form-input"
                value={resetData.new_password}
                onChange={(e) => setResetData({...resetData, new_password: e.target.value})}
                placeholder="Enter new password"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                value={resetData.confirm_password}
                onChange={(e) => setResetData({...resetData, confirm_password: e.target.value})}
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="auth-links">
            <button type="button" onClick={resetToLogin} className="link-btn">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLogin) {
    return (
      <div className="auth-container">
        {/* Theme Toggle for Login Pages */}
        <button 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--bg-primary)',
            border: '2px solid var(--border-light)',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-secondary)',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1001,
            minWidth: '100px',
            justifyContent: 'center'
          }}
          onClick={toggleTheme}
        >
          <span style={{ marginRight: '6px' }}>
            {getCurrentTheme() === 'light' ? '🌙' : '☀️'}
          </span>
          {getCurrentTheme() === 'light' ? 'Dark' : 'Light'}
        </button>
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">AP</div>
            <h1 className="auth-title">Assessment Portal</h1>
            <p className="auth-subtitle">Sign in to access your placement assessment</p>
          </div>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-links">
            <button type="button" onClick={() => setIsForgotPassword(true)} className="link-btn">
              Forgot your password?
            </button>
            <button type="button" onClick={() => setIsLogin(false)} className="link-btn">
              Don't have an account? Register here
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="auth-container">
      {/* Theme Toggle for Login Pages */}
      <button 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'var(--bg-primary)',
          border: '2px solid var(--border-light)',
          borderRadius: '8px',
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--text-secondary)',
          transition: 'all 0.3s ease',
          boxShadow: 'var(--shadow-md)',
          zIndex: 1001,
          minWidth: '100px',
          justifyContent: 'center'
        }}
        onClick={toggleTheme}
      >
        <span style={{ marginRight: '6px' }}>
          {getCurrentTheme() === 'light' ? '🌙' : '☀️'}
        </span>
        {getCurrentTheme() === 'light' ? 'Dark' : 'Light'}
      </button>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">AP</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Register for placement assessment access</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSignupSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-input"
              value={signupData.name}
              onChange={(e) => setSignupData({...signupData, name: e.target.value})}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signupEmail">Email Address</label>
            <input
              type="email"
              id="signupEmail"
              className="form-input"
              value={signupData.email}
              onChange={(e) => setSignupData({...signupData, email: e.target.value})}
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="signupPassword">Password</label>
            <input
              type="password"
              id="signupPassword"
              className="form-input"
              value={signupData.password}
              onChange={(e) => setSignupData({...signupData, password: e.target.value})}
              placeholder="Create a strong password"
              required
              disabled={loading}
            />
            <div className="form-hint">Minimum 8 characters with uppercase, lowercase, and number</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPasswordSignup">Confirm Password</label>
            <input
              type="password"
              id="confirmPasswordSignup"
              className="form-input"
              value={signupData.confirmPassword}
              onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
              placeholder="Confirm your password"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              className="form-input"
              value={signupData.phone}
              onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
              placeholder="Enter your phone number"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              className="form-input"
              min="16"
              max="65"
              value={signupData.age}
              onChange={(e) => setSignupData({...signupData, age: e.target.value})}
              placeholder="Enter your age"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gender">Gender</label>
            <select
              id="gender"
              className="form-select"
              value={signupData.gender}
              onChange={(e) => setSignupData({...signupData, gender: e.target.value})}
              required
              disabled={loading}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-links">
          <button type="button" onClick={() => setIsLogin(true)} className="link-btn">
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
