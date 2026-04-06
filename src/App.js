import React, { useState, useEffect, useMemo } from "react";
import QuoteBox from "./components/QuoteBox";
import "./App.css";

function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.3 + 0.05,
    })), []);

  return (
    <div className="particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size + 'px',
            height: p.size + 'px',
            left: p.x + '%',
            top: p.y + '%',
            animationDuration: p.duration + 's',
            animationDelay: p.delay + 's',
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    document.body.className = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  return (
    <div className={`App ${isDarkMode ? "dark" : "light"}`}>
      {/* Animated background */}
      <div className="bg-gradient"></div>
      <FloatingParticles />

      <div className="fog-container">
        <div className="fog fog1"></div>
        <div className="fog fog2"></div>
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <svg className="logo-icon-svg" viewBox="0 0 36 36" width="36" height="36">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#667eea'}}/>
                <stop offset="100%" style={{stopColor:'#764ba2'}}/>
              </linearGradient>
            </defs>
            <rect width="36" height="36" rx="8" fill="url(#logoGrad)"/>
            <text x="5" y="27" fontFamily="Georgia, serif" fontSize="28" fontWeight="bold" fill="white" opacity="0.95">"</text>
          </svg>
          <span className="logo-text">QuoteVerse</span>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <span className={`toggle-icon ${isDarkMode ? 'rotate-in' : 'rotate-out'}`}>
            {isDarkMode ? "\uD83C\uDF19" : "\u2600\uFE0F"}
          </span>
        </button>
      </header>

      {/* Main */}
      <main className="main-content">
        <QuoteBox />
      </main>

    </div>
  );
}

export default App;
