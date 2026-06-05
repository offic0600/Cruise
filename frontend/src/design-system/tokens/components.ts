export const componentTokens = {
  button: {
    height: {
      xs: '1.875rem',
      sm: '2.125rem',
      md: '2.625rem',
      lg: '2.875rem',
      xl: '3.25rem',
    },
    paddingX: {
      xs: '0.625rem',
      sm: '0.75rem',
      md: '0.875rem',
      lg: '1rem',
      xl: '1.125rem',
    },
  },
  input: {
    height: {
      md: '2.75rem',
      lg: '3rem',
    },
  },
  card: {
    padding: {
      sm: '1rem',
      md: '1.25rem',
      lg: '1.5rem',
    },
  },
  nav: {
    itemHeight: '2.75rem',
    itemRadius: '1rem',
  },
  propertyPill: {
    height: '2rem',
    radius: '999px',
  },
} as const;

export type ComponentTokens = typeof componentTokens;
