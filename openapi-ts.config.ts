import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:8080/v3/api-docs/CAS3Shared',
  output: {
    path: './script/heyapi-output',
    postProcess: ['prettier'],
  },
  plugins: [
    '@hey-api/client-axios',
    '@hey-api/schemas',
    {
      dates: true,
      name: '@hey-api/transformers',
    },
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/sdk',
      transformer: true,
    },
  ],
})
