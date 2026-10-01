import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../AppContext.jsx";

export default function AuthPage({ signup = false }) {
  const { login, signup: createAccount, user } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const session = signup ? await createAccount(data) : await login(data);
      navigate(session.role === "admin" ? "/admin" : "/");
    } catch (issue) {
      setError(issue.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  return (
    <main className="auth-layout">
      <section className="auth-art">
        <div className="auth-art-content">
          <span className="eyebrow light">YOUR NEXT ADVENTURE STARTS HERE</span>
          <h1>The world is<br />closer than<br />you think.</h1>
          <p>Find your flight. Follow your curiosity.</p>
          <div className="art-route"><span>PNQ</span><i></i><span>BOM</span></div>
        </div>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <span className="eyebrow">{signup ? "JOIN FLIGHTLY" : "WELCOME BACK"}</span>
          <h2>{signup ? "Create your account" : "Log in to Flightly"}</h2>
          <p className="muted">{signup ? "A better way to get where you’re going." : "Your next trip is just a few clicks away."}</p>
          {error && <div className="notice error">{error}</div>}
          <form onSubmit={submit} className="stack-form">
            {signup && <label>Full name<input name="name" placeholder="Alex Morgan" required minLength="2" autoComplete="name" /></label>}
            <label>Email address<input name="email" type="email" placeholder="you@example.com" required autoComplete="email" /></label>
            <label>Password<input name="password" type="password" placeholder="At least 8 characters" required minLength="8" autoComplete={signup ? "new-password" : "current-password"} /></label>
            {signup && <label>Account type<select name="role" defaultValue="user"><option value="user">Traveler</option><option value="admin">Administrator</option></select></label>}
            <button className="button full" disabled={busy}>{busy ? "Please wait…" : signup ? "Create account" : "Log in"} <span>→</span></button>
          </form>
          <p className="auth-switch">{signup ? "Already have an account?" : "New to Flightly?"} <Link to={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link></p>
          {signup && <p className="security-note">Passwords are salted and hashed before being stored on this device.</p>}
        </div>
      </section>
    </main>
  );
}
