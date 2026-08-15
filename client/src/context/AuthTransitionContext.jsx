import { createContext, useContext, useRef, useState } from 'react';
import BrandMark from '../components/BrandMark';

const AuthTransitionContext = createContext(null);

// A brief full-screen loading effect shown while a login or logout request
// is in flight, so account transitions never feel like a blank/instant jump.
// A clockwise ring spins around the centered brand mark + wordmark. Shared
// by both the customer AuthContext and the admin AdminAuthContext so both
// surfaces get identical treatment.
const MIN_VISIBLE_MS = 550;

export const AuthTransitionProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0);

  const showAuthLoader = () => {
    shownAtRef.current = Date.now();
    setVisible(true);
  };

  const hideAuthLoader = () => {
    const elapsed = Date.now() - shownAtRef.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    window.setTimeout(() => setVisible(false), remaining);
  };

  // Wraps an async login/logout call so callers don't have to remember the
  // show/hide pair or handle the error path themselves.
  const runWithAuthLoader = async (fn) => {
    showAuthLoader();
    try {
      return await fn();
    } finally {
      hideAuthLoader();
    }
  };

  return (
    <AuthTransitionContext.Provider value={{ showAuthLoader, hideAuthLoader, runWithAuthLoader }}>
      {children}
      {visible && (
        <div className="fixed inset-0 z-[999] bg-cream/95 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '1.1s' }}>
                <circle cx="40" cy="40" r="35" fill="none" stroke="#E9DFCE" strokeWidth="4" />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="#A9662A"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="55 165"
                />
              </svg>
              <BrandMark className="w-7 h-7" />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif text-lg tracking-wide text-ink">AL SA&apos;I</span>
              <span className="text-[8px] tracking-[0.3em] text-muted">EXTRAIT DE PARFUM</span>
            </div>
          </div>
        </div>
      )}
    </AuthTransitionContext.Provider>
  );
};

export const useAuthTransition = () => useContext(AuthTransitionContext);
