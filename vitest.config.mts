import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    testTimeout: 15000,
    hookTimeout: 60000,
    // Test files share one live Postgres instance and one file resets it
    // entirely (`supabase db reset`) — files must run sequentially, never
    // interleaved, or a reset mid-run would wipe out another file's fixtures.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
});
