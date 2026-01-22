
import { useState } from 'react';
import type { {{entityName}} } from '@entities/{{entityName}}/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCreate{{entityName}}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newItem: Omit<{{entityName}}, 'id'>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Created:', newItem);
    setIsLoading(false);
    return { ...newItem, id: Math.random().toString() } as {{entityName}};
  };

  return { mutate, isLoading };
}
