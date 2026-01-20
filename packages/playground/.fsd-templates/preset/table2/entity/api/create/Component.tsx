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

export function useCreate${baseName}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newItem: Omit<${baseName}, 'id'>) => {
    setIsLoading(true);
    await delay(500);
    console.log('Created:', newItem);
    setIsLoading(false);
    return { ...newItem, id: Math.random().toString() } as ${baseName};
  };

  return { mutate, isLoading };
}
`;
};
