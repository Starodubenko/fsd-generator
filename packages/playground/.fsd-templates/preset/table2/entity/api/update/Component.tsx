import { useState } from 'react';
import type { {{baseName}} } from '../model/types';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useUpdate{{baseName}}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id: string, updates: Partial<{{baseName}}>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Updated:', id, updates);
    setIsLoading(false);
  };

  return { mutate, isLoading };
}
