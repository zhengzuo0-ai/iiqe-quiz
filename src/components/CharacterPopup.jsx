import { useState, useEffect, useCallback } from 'react';
import { getRandomCharacter } from '../lib/characters';

// Named export for ExamMode celebration
export function CelebrationPopup({ show }) {
  if (!show) return null;
  return <CharacterPopup mood="celebrate" trigger={show ? 1 : 0} duration={5000} />;
}

export default function CharacterPopup({ mood, trigger, onDone, duration = 3500 }) {
  const [character, setCharacter] = useState(null);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!mood || !trigger) return;
    
    const char = getRandomCharacter(mood);
    setCharacter(char);
    setLeaving(false);
    
    // Slide in
    requestAnimationFrame(() => setVisible(true));
    
    // Start leaving
    const leaveTimer = setTimeout(() => setLeaving(true), duration - 500);
    // Close
    const closeTimer = setTimeout(() => {
      setVisible(false);
      setCharacter(null);
      onDone?.();
    }, duration);
    
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(closeTimer);
    };
  }, [mood, trigger]);

  if (!character) return null;

  const isOhtani = character.isEasterEgg;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 pointer-events-none"
      style={{
        transform: `translateX(-50%) translateY(${visible && !leaving ? '0' : '120%'})`,
        opacity: leaving ? 0 : 1,
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
      }}
    >
      <div
        className="pointer-events-auto flex items-end gap-3 px-4 py-3 rounded-2xl shadow-lg max-w-[340px]"
        style={{
          background: isOhtani 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
            : 'linear-gradient(135deg, #fff5f7 0%, #fef0f5 50%, #f5f0ff 100%)',
          border: isOhtani ? '2px solid #e94560' : '2px solid #f5c6d0',
        }}
      >
        {/* Character image */}
        <div className="flex-shrink-0 relative">
          <img
            src={character.pose}
            alt={character.name}
            className="w-20 h-20 object-contain"
            style={{ 
              animation: 'characterBounce 0.6s ease-out',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
            }}
          />
          {isOhtani && (
            <span className="absolute -top-1 -right-1 text-lg animate-bounce">⚾</span>
          )}
        </div>
        {/* Speech bubble */}
        <div className="flex-1 min-w-0">
          <div 
            className="text-xs font-semibold mb-1"
            style={{ color: isOhtani ? '#e94560' : '#c084a0' }}
          >
            {character.emoji} {character.name}
          </div>
          <div
            className="text-sm leading-relaxed whitespace-pre-line"
            style={{ 
              color: isOhtani ? '#eee' : '#5a4a5a',
              fontFamily: "var(--font-chinese)",
            }}
          >
            {character.line}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes characterBounce {
          0% { transform: scale(0.3) translateY(20px); opacity: 0; }
          50% { transform: scale(1.1) translateY(-5px); }
          70% { transform: scale(0.95) translateY(2px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
