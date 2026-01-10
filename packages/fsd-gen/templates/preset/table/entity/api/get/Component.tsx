import { useState, useEffect } from 'react';
import type { {{componentName}} } from '../model/types';
import { mock{{componentName}}Data } from '../model/types';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useGet{{componentName}}s() {
  const [data, setData] = useState<{{componentName}}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchData() {
      setIsLoading(true);
      try {
        await delay(500);
        if (mounted) setData(mock{{componentName}}Data);
      } catch (e) {
        if (mounted) setError(e as Error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchData();

    return () => { mounted = false; };
  }, []);

  return { data, isLoading, error };
}
