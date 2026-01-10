import { useState } from 'react';
import type { Product } from '../model/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCreateProduct() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newItem: Omit<Product, 'id'>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Created:', newItem);
    setIsLoading(false);
    return { ...newItem, id: Math.random().toString() } as Product;
  };

  return { mutate, isLoading };
}
