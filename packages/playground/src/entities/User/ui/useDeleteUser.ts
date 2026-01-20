
import { useState } from 'react';
import type { User } from '@entities/User/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useDeleteUser() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id: string) => {
    setIsLoading(true);
    await delay(500);
    console.log('Deleted:', id);
    setIsLoading(false);
  };

  return { mutate, isLoading };
}
