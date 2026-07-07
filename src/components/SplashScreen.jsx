import { useEffect, useState } from 'react';

// Spark positions pre-generated
const SPARKS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 3,
  left: Math.random() * 100,
  top: Math.random() * 100,
  dur: (Math.random() * 2 + 2).toFixed(1),
  delay: (Math.random() * 3).toFixed(1),
}));

export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 3.6s
    const timer = setTimeout(handleExit, 3600);
    return () => clearTimeout(timer);
  }, []);

  function handleExit() {
    setExiting(true);
    setTimeout(onDone, 650);
  }

  return (
    <div
      className={`splash ${exiting ? 'splash-exit' : ''}`}
      onClick={handleExit}
      role="dialog"
      aria-label="Welcome splash screen"
    >
      {/* Floating spark particles */}
      <div className="splash-particles">
        {SPARKS.map(s => (
          <div
            key={s.id}
            className="spark"
            style={{
              width: s.size, height: s.size,
              left: `${s.left}%`, top: `${s.top}%`,
              '--dur': `${s.dur}s`, '--delay': `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="splash-tagline">🙏 Jai Shree Ram 🙏</div>

      <div className="splash-diya">🪔</div>

      <div className="splash-welcome">Welcome to</div>

      <div className="splash-name">
        <span className="line1">'Shree Ram'</span>
        <span className="line2">Aapna Misthan Bhandar</span>
      </div>

      <div className="splash-divider" />

      <div className="splash-subtitle">🍬 Fresh • Pure • Delicious 🔺</div>

      {/* Loading dots */}
      <div className="splash-dots">
        <div className="splash-dot" />
        <div className="splash-dot" />
        <div className="splash-dot" />
      </div>
    </div>
  );
}
