import { useEffect, useRef } from 'react';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

/**
 * Shared session-guard behavior for both the customer and admin panels:
 * - Auto-logs out after `inactivityMinutes` of no user interaction (mouse,
 *   keyboard, scroll, or touch).
 * - Switching to another browser tab, minimizing the window, or the tab
 *   simply being backgrounded does NOT log the user out - only genuine
 *   inactivity on the page does. The inactivity timer keeps counting down in
 *   the background regardless of tab visibility, so a customer who switches
 *   tabs and comes back within `inactivityMinutes` stays logged in.
 */
const useSessionGuard = ({ isAuthenticated, onLogout, inactivityMinutes = 10 }) => {
  const inactivityTimer = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const resetInactivityTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(onLogout, inactivityMinutes * 60 * 1000);
    };

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isAuthenticated, onLogout, inactivityMinutes]);
};

export default useSessionGuard;
