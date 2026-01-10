import { useState } from 'react';
import type { AliasedTable2 } from '../model/types';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCreateAliasedTable2() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newItem: Omit<AliasedTable2, 'id'>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Created:', newItem);
    setIsLoading(false);
    return { ...newItem, id: Math.random().toString() } as AliasedTable2;
  };

  return { mutate, isLoading };
}
