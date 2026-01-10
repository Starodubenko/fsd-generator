import { useState } from 'react';
import type { Product } from '../model/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useUpdateProduct() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id: string, updates: Partial<Product>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Updated:', id, updates);
    setIsLoading(false);
  };

  return { mutate, isLoading };
}
