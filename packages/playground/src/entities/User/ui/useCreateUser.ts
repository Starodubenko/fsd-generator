
import { useState } from 'react';
import type { User } from '@entities/User/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newItem: Omit<User, 'id'>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Created:', newItem);
    setIsLoading(false);
    return { ...newItem, id: Math.random().toString() } as User;
  };

  return { mutate, isLoading };
}
