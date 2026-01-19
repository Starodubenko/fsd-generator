import { TemplateContext } from '@starodubenko/fsd-gen';

export default (ctx: TemplateContext) => `
import { useState } from 'react';
import type { ${ctx.baseName} } from '../model/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useUpdate${ctx.baseName}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id: string, updates: Partial<${ctx.baseName}>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Updated:', id, updates);
    setIsLoading(false);
  };

  return { mutate, isLoading };
}
`;
