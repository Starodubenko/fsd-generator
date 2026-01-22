
import { useState } from 'react';
import type { {{entityName}} } from '@entities/{{entityName}}/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useUpdate{{entityName}}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id: string, updates: Partial<{{entityName}}>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Updated:', id, updates);
    setIsLoading(false);
  };

  return { mutate, isLoading };
}
