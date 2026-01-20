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
import { useState, useEffect } from 'react';
import type { ${baseName} } from '${entityImportPath}/model';
import { mock${baseName}Data } from '${entityImportPath}/model';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useGet${baseName}s() {
  const [data, setData] = useState<${baseName}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchData() {
      setIsLoading(true);
      try {
        await delay(500);
        if (mounted) setData(mock${baseName}Data);
      } catch (e) {
        if (mounted) setError(e as Error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchData();

    return () => { mounted = false; };
  }, []);

  return { data, isLoading, error };
}
`;
};
