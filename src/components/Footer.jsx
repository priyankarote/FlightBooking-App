import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <Link className="brand" to="/"><span className="brand-mark">f</span> flightly<span className="brand-dot">.</span></Link>
      <span>Made for the joy of getting there.</span>
      <span>© {new Date().getFullYear()} Flightly</span>
    </footer>
  );
}
