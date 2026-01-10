import { useState } from 'react';
import type { {{componentName}} } from '../model/types';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCreate{{componentName}}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newItem: Omit<{{componentName}}, 'id'>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Created:', newItem);
    setIsLoading(false);
    return { ...newItem, id: Math.random().toString() } as {{componentName}};
  };

  return { mutate, isLoading };
}
