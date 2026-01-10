import { useState } from 'react';
import type { TestTable } from '../model/types';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCreateTestTable() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newItem: Omit<TestTable, 'id'>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Created:', newItem);
    setIsLoading(false);
    return { ...newItem, id: Math.random().toString() } as TestTable;
  };

  return { mutate, isLoading };
}
