import { useEffect, useState } from 'react';

// Returns Date.now() and forces a re-render every `intervalMs`. Used to keep
// time-derived UI (LifeContext.hourOfDay, solar.isDaylight, decay-driven
// stats) in sync without a heavy global clock object.
export function useNowMs(intervalMs: number = 1000): number {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => {
      clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}
