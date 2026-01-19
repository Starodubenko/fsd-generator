
import { useState } from 'react';
import type { Table } from '../model/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useUpdateTable() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id: string, updates: Partial<Table>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Updated:', id, updates);
    setIsLoading(false);
  };

  return { mutate, isLoading };
}
