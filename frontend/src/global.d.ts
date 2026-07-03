// ─── Allow .jsx and .js modules to be imported from TypeScript ──
// These are progressively migrated to TypeScript; until then,
// their exports are treated as `any` for type-checking purposes.

declare module '*.jsx' {
  import type { ComponentType } from 'react'
  const component: ComponentType<any>
  export default component
}


