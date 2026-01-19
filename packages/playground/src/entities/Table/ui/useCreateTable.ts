
import { useState } from 'react';
import type { Table } from '../model/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCreateTable() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newItem: Omit<Table, 'id'>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Created:', newItem);
    setIsLoading(false);
    return { ...newItem, id: Math.random().toString() } as Table;
  };

  return { mutate, isLoading };
}
