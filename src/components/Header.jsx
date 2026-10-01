import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../AppContext.jsx";

export default function Header() {
  const { user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="topbar">
      <Link className="brand" to="/"><span className="brand-mark">f</span> flightly<span className="brand-dot">.</span></Link>
      <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <nav className={menuOpen ? "nav-links open" : "nav-links"}>
        {user?.role === "user" && <Link to="/my-bookings">My trips</Link>}
        {user?.role === "admin" && <Link to="/admin">Dashboard</Link>}
        {user ? (
          <div className="account-chip"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><span>{user.name}</span><button className="text-button" onClick={logout}>Sign out</button></div>
        ) : (
          <><Link to="/login">Log in</Link><Link className="button button-small" to="/signup">Get started <span>↗</span></Link></>
        )}
      </nav>
    </header>
  );
}
