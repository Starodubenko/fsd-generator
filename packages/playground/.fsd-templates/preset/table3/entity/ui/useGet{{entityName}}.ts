
import { useState, useEffect } from 'react';
import type { {{entityName}} } from '@entities/{{entityName}}/model';
import { mock{{entityName}}Data } from '@entities/{{entityName}}/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useGet{{entityName}}() {
  const [data, setData] = useState<{{entityName}}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchData() {
      setIsLoading(true);
      try {
        await delay(500);
        if (mounted) setData(mock{{entityName}}Data);
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
