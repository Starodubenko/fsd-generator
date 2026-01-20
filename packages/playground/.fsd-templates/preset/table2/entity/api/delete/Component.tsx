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

export function useDelete${baseName}() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id: string) => {
    setIsLoading(true);
    await delay(500);
    console.log('Deleted:', id);
    setIsLoading(false);
  };

  return { mutate, isLoading };
}
`;
};
