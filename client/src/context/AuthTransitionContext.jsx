import { createContext, useContext, useRef, useState } from 'react';
import BrandSpinner from '../components/BrandSpinner';

const AuthTransitionContext = createContext(null);

// A brief full-screen loading effect shown while a login or logout request
// is in flight, so account transitions never feel like a blank/instant jump.
// Uses the signature luxury BrandSpinner. Shared by both customer AuthContext
// and AdminAuthContext.
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
          <BrandSpinner />
        </div>
      )}
    </AuthTransitionContext.Provider>
  );
};

export const useAuthTransition = () => useContext(AuthTransitionContext);
