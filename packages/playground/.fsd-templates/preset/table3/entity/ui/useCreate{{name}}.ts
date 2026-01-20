
import { useState } from 'react';
import type { {{name}} } from '@entities/{{name}}/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCreate{{name}}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newItem: Omit<{{name}}, 'id'>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Created:', newItem);
    setIsLoading(false);
    return { ...newItem, id: Math.random().toString() } as {{name}};
  };

  return { mutate, isLoading };
}
