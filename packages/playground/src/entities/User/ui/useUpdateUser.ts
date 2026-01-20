
import { useState } from 'react';
import type { User } from '@entities/User/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useUpdateUser() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id: string, updates: Partial<User>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Updated:', id, updates);
    setIsLoading(false);
  };

  return { mutate, isLoading };
}
