import { CodegenConfig } from '@graphql-codegen/cli';

const url =
  process.env.GRAPHQL_ENDPOINT ?? 'http://localhost:3000/api/graphql';

const config: CodegenConfig = {
  schema: url,
  documents: 'src/graphql/**/*.{gql,graphql,ts,tsx}',
  generates: {
    'src/graphql/__generated__/': {
      preset: 'client',
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
    },
  },
};

export default config;
