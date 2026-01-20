
import { useState } from 'react';
import type { {{name}} } from '@entities/{{name}}/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useDelete{{name}}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id: string) => {
    setIsLoading(true);
    await delay(500);
    console.log('Deleted:', id);
    setIsLoading(false);
  };

  return { mutate, isLoading };
}
