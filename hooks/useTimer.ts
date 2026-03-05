import { useRef, useState, useCallback, useEffect } from 'react';

interface UseTimerOptions {
  duration: number; // seconds
  onTimeUp: () => void;
}

export function useTimer({ duration, onTimeUp }: UseTimerOptions) {
  const [remaining, setRemaining] = useState(duration);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isRunningRef.current = false;
  }, []);

  const start = useCallback(() => {
    clear();
    startTimeRef.current = Date.now();
    setRemaining(duration);
    isRunningRef.current = true;

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);

      if (left <= 0) {
        clear();
        onTimeUp();
      }
    }, 100); // Update every 100ms for smooth bar animation
  }, [duration, onTimeUp, clear]);

  const reset = useCallback(
    (newDuration?: number) => {
      clear();
      const d = newDuration ?? duration;
      setRemaining(d);
      startTimeRef.current = Date.now();
      isRunningRef.current = true;

      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const left = Math.max(0, d - elapsed);
        setRemaining(left);

        if (left <= 0) {
          clear();
          onTimeUp();
        }
      }, 100);
    },
    [duration, onTimeUp, clear],
  );

  const getElapsedMs = useCallback(() => {
    if (startTimeRef.current === 0) return 0;
    return Date.now() - startTimeRef.current;
  }, []);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  const progress = duration > 0 ? remaining / duration : 0;

  return { remaining, progress, start, reset, clear, getElapsedMs };
}
