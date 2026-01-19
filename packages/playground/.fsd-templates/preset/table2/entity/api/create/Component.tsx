import { TemplateContext } from '@starodubenko/fsd-gen';

export default (ctx: TemplateContext) => `
import { useState } from 'react';
import type { ${ctx.baseName} } from '../model/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCreate${ctx.baseName}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newItem: Omit<${ctx.baseName}, 'id'>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Created:', newItem);
    setIsLoading(false);
    return { ...newItem, id: Math.random().toString() } as ${ctx.baseName};
  };

  return { mutate, isLoading };
}
`;
