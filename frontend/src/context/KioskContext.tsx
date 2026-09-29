import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { KioskInactivityModal } from '../components/kiosk/KioskInactivityModal';
import { KioskMaintenanceOverlay } from '../components/kiosk/KioskMaintenanceOverlay';

interface KioskContextType {
  isKiosk: boolean;
  toggleKiosk: () => void;
  enterKiosk: () => void;
  exitKiosk: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  isMaintenance: boolean;
  maintenanceMessage: string;
  setMaintenanceMode: (active: boolean, message?: string) => void;
  isOffline: boolean;
  idleTimeoutSeconds: number;
  setIdleTimeoutSeconds: (seconds: number) => void;
  resetSession: () => void;
  continueSession: () => void;
  registerResetCallback: (cb: () => void) => () => void;
}

const KioskContext = createContext<KioskContextType | undefined>(undefined);

const DEFAULT_IDLE_TIMEOUT = 120; // 2 minutes
const WARNING_WINDOW = 15; // Warning during last 15 seconds

export const KioskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isKiosk, setIsKiosk] = useState<boolean>(() => {
    return localStorage.getItem('ambedkar_archive_kiosk') === 'true';
  });
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('Terminal under maintenance.');
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [idleTimeoutSeconds, setIdleTimeoutSeconds] = useState<number>(DEFAULT_IDLE_TIMEOUT);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(WARNING_WINDOW);

  const resetCallbacksRef = useRef<Set<() => void>>(new Set());
  const idleTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync DOM classes for kiosk mode & high contrast
  useEffect(() => {
    localStorage.setItem('ambedkar_archive_kiosk', isKiosk ? 'true' : 'false');
    if (isKiosk) {
      document.documentElement.classList.add('kiosk-mode');
    } else {
      document.documentElement.classList.remove('kiosk-mode');
    }
  }, [isKiosk]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const registerResetCallback = useCallback((cb: () => void) => {
    resetCallbacksRef.current.add(cb);
    return () => {
      resetCallbacksRef.current.delete(cb);
    };
  }, []);

  const resetSession = useCallback(() => {
    // Clear warning & interval
    setShowWarning(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Reset accessibility state
    setFontSize('normal');
    setHighContrast(false);

    // Atomic storage scrub for visitor privacy (Section 3.1)
    try {
      sessionStorage.clear();
      const keysToClear = Object.keys(localStorage).filter(k => k !== 'ambedkar_archive_kiosk');
      keysToClear.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Kiosk storage scrub notice:', e);
    }

    // Call registered component reset callbacks (ephemeral search/RAG/media state)
    resetCallbacksRef.current.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Error during session reset callback:', err);
      }
    });

    // Navigate to homepage if in kiosk mode
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, []);


  const startWarningCountdown = useCallback(() => {
    setShowWarning(true);
    setRemainingSeconds(WARNING_WINDOW);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          resetSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [resetSession]);

  const continueSession = useCallback(() => {
    setShowWarning(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Restart idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (isKiosk) {
      const waitMs = Math.max(1000, (idleTimeoutSeconds - WARNING_WINDOW) * 1000);
      idleTimerRef.current = setTimeout(() => {
        startWarningCountdown();
      }, waitMs);
    }
  }, [isKiosk, idleTimeoutSeconds, startWarningCountdown]);

  // Activity detection
  useEffect(() => {
    if (!isKiosk) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setShowWarning(false);
      return;
    }

    const onUserActivity = () => {
      // If warning modal is currently showing, user touching/moving inside modal will be handled by buttons,
      // but touching screen or pressing keys anywhere resets session warning.
      if (showWarning) {
        continueSession();
        return;
      }

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      const waitMs = Math.max(1000, (idleTimeoutSeconds - WARNING_WINDOW) * 1000);
      idleTimerRef.current = setTimeout(() => {
        startWarningCountdown();
      }, waitMs);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, onUserActivity, { passive: true }));

    // Start initial timer
    const initialWaitMs = Math.max(1000, (idleTimeoutSeconds - WARNING_WINDOW) * 1000);
    idleTimerRef.current = setTimeout(() => {
      startWarningCountdown();
    }, initialWaitMs);

    return () => {
      events.forEach(event => window.removeEventListener(event, onUserActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isKiosk, idleTimeoutSeconds, showWarning, startWarningCountdown, continueSession]);

  const toggleKiosk = () => setIsKiosk(prev => !prev);
  const enterKiosk = () => setIsKiosk(true);
  const exitKiosk = () => setIsKiosk(false);
  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const setMaintenanceMode = (active: boolean, message?: string) => {
    setIsMaintenance(active);
    if (message) setMaintenanceMessage(message);
  };

  return (
    <KioskContext.Provider value={{
      isKiosk,
      toggleKiosk,
      enterKiosk,
      exitKiosk,
      fontSize,
      setFontSize,
      highContrast,
      toggleHighContrast,
      isMaintenance,
      maintenanceMessage,
      setMaintenanceMode,
      isOffline,
      idleTimeoutSeconds,
      setIdleTimeoutSeconds,
      resetSession,
      continueSession,
      registerResetCallback
    }}>
      {children}

      {/* Ephemeral Session Reset Countdown Warning Modal */}
      {isKiosk && showWarning && (
        <KioskInactivityModal
          countdownSeconds={remainingSeconds}
          onContinue={continueSession}
          onResetNow={resetSession}
        />
      )}

      {/* Terminal Under Remote Maintenance Overlay */}
      {isKiosk && isMaintenance && (
        <KioskMaintenanceOverlay
          message={maintenanceMessage}
        />
      )}
    </KioskContext.Provider>
  );
};

export const useKiosk = (): KioskContextType => {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error('useKiosk must be used within a KioskProvider');
  }
  return context;
};
