import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const WARNING_DURATION = 2 * 60 * 1000; // 2 minutes warning

export const useSessionTimeout = () => {
  const { logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();

  const resetTimeout = () => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Set warning timeout (8 minutes)
    warningRef.current = setTimeout(() => {
      const shouldContinue = window.confirm(
        'Your session will expire in 2 minutes due to inactivity. Click OK to continue your session.'
      );
      
      if (shouldContinue) {
        resetTimeout(); // Reset the timeout if user wants to continue
      }
    }, TIMEOUT_DURATION - WARNING_DURATION);

    // Set logout timeout (10 minutes)
    timeoutRef.current = setTimeout(() => {
      logout();
      alert('Your session has expired due to inactivity. Please log in again.');
    }, TIMEOUT_DURATION);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimeoutHandler = () => {
      resetTimeout();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimeoutHandler, true);
    });

    // Handle page visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, start a shorter timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          logout();
        }, 5 * 60 * 1000); // 5 minutes when tab is hidden
      } else {
        // Page is visible again, reset normal timeout
        resetTimeout();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialize timeout
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimeoutHandler, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [logout]);

  return { resetTimeout };
};