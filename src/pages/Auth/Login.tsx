import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await signIn(email.trim(), password);

    setSubmitting(false);

    if (error) {
      setError('Incorrect email or password. Try again.');
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <img src="/logo.png" alt="Total Insulation" className="auth-logo" />
        <h1 className="auth-title">Total Insulation Hub</h1>
        <p className="auth-subtitle">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="you@totalinsulation.com.au"
          />

          <label className="auth-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            placeholder="••••••••"
          />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
