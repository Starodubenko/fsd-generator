
import { useState, useEffect } from 'react';
import type { User } from '@entities/User/model';
import { mockUserData } from '@entities/User/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useGetUsers() {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchData() {
      setIsLoading(true);
      try {
        await delay(500);
        if (mounted) setData(mockUserData);
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
