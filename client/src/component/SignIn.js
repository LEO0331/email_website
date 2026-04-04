import React from 'react';
import { Link } from 'react-router-dom';

const SignIn = () => {
  return (
    <section className="auth-shell">
      <div className="auth-card">
        <p className="auth-eyebrow">Welcome back</p>
        <h1 className="auth-title">Sign in to Emaily</h1>
        <p className="auth-description">
          Continue with the demo Google flow to access surveys and send campaigns.
        </p>

        <div className="auth-field-group">
          <label className="auth-label" htmlFor="auth-email">Email</label>
          <input id="auth-email" className="auth-input" type="email" placeholder="you@company.com" disabled />
        </div>
        <div className="auth-field-group">
          <label className="auth-label" htmlFor="auth-password">Password</label>
          <input id="auth-password" className="auth-input" type="password" placeholder="••••••••" disabled />
        </div>

        <a className="btn auth-primary-btn" href="/auth/google">Continue with Google</a>
        <Link className="auth-secondary-link" to="/">Back to home</Link>
      </div>
    </section>
  );
};

export default SignIn;
