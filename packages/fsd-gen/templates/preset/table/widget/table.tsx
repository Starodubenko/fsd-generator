import type { GeneratorContext } from '../../../../src/config/types.js';

export default (ctx: GeneratorContext) => {
  const {
      base: { baseName },
      template: { componentName },
      layer: {
          entity: { apiPath: entityApiPath },
          features: { importPath: featureImportPath }
      }
  } = ctx;

  return `
import styled from '@emotion/styled';
import { ${baseName}, mock${baseName}Data } from '${entityApiPath}';
// Note: Assuming specific button names based on feature convention, or should be generic?
// For the Table preset, it assumes Create/Edit/Delete buttons exist in the feature slice.
import { Create${baseName}Button, Edit${baseName}Button, Delete${baseName}Button } from '${featureImportPath}';

const TableWrapper = styled.div\`
  border: 1px solid #eee;
  padding: 1rem;
\`;

const Table = styled.table\`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
\`;

export const ${componentName} = () => {
  return (
    <TableWrapper>
      <div style={{ marginBottom: '1rem' }}>
        <Create${baseName}Button />
      </div>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mock${baseName}Data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>
                <Edit${baseName}Button />
                <Delete${baseName}Button />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};
`;
};
