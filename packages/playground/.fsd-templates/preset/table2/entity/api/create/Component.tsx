import { useState } from 'react';
import type { {{baseName}} } from '../model/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCreate{{baseName}}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newItem: Omit<{{baseName}}, 'id'>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Created:', newItem);
    setIsLoading(false);
    return { ...newItem, id: Math.random().toString() } as {{baseName}};
  };

  return { mutate, isLoading };
}
