import React from 'react';
import { Link } from 'react-router-dom';

const SignOut = () => {
  return (
    <section className="auth-shell">
      <div className="auth-card">
        <p className="auth-eyebrow">Session</p>
        <h1 className="auth-title">Ready to sign out?</h1>
        <p className="auth-description">
          You can safely end your current session and return anytime.
        </p>

        <a className="btn auth-danger-btn" href="/api/logout">Sign out</a>
        <Link className="auth-secondary-link" to="/surveys">Stay signed in</Link>
      </div>
    </section>
  );
};

export default SignOut;
