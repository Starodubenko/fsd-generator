import type { GeneratorContext } from '@starodubenko/fsd-gen';

export default (ctx: GeneratorContext) => {
  const {
    base: { baseName },
    template: { componentName },
    layer: {
      entity: { importPath: entityImportPath }
    }
  } = ctx;

  return `
import { useState } from 'react';
import type { ${baseName} } from '${entityImportPath}/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useUpdate${baseName}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id: string, updates: Partial<${baseName}>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Updated:', id, updates);
    setIsLoading(false);
  };

  return { mutate, isLoading };
}
`;
};
