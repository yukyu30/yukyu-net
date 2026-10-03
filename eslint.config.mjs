import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  globalIgnores(['.next/**', 'public/_pagefind/**', 'next-env.d.ts']),
  {
    // Existing route/PiP state synchronization predates the lint migration.
    // Keep these diagnostics visible without changing navigation in a dependency update.
    files: ['src/components/console-navigation.tsx', 'src/components/picture-in-picture-search.tsx'],
    rules: { 'react-hooks/set-state-in-effect': 'warn' }
  },
  {
    // This Three.js bridge deliberately mutates an externally managed DOM surface.
    files: ['src/components/console-surface.tsx'],
    rules: { 'react-hooks/immutability': 'off' }
  },
  {
    // The anchor implements history-aware back navigation, including modifier clicks.
    files: ['src/components/memo-back-link.tsx'],
    rules: { '@next/next/no-html-link-for-pages': 'off' }
  }
])
