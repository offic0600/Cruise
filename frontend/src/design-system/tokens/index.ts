import { componentTokens } from './components';
import { foundations } from './foundations';
import { semanticTokens } from './semantic';

export const designTokenContract = {
  foundations,
  semantic: semanticTokens,
  components: componentTokens,
} as const;

export type DesignTokenContract = typeof designTokenContract;

export * from './components';
export * from './foundations';
export * from './semantic';
