import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders primary button variants through the design system contract', () => {
    render(<Button variant="primary" size="lg">Create issue</Button>);
    const button = screen.getByRole('button', { name: 'Create issue' });
    expect(button).toHaveClass('bg-brand-gradient');
    expect(button).toHaveClass('h-[var(--button-height-lg)]');
  });

  it('renders secondary icon button variants through the design system contract', () => {
    render(<Button variant="secondary" size="icon-md" aria-label="Search" />);
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toHaveClass('border-border-soft');
    expect(button).toHaveClass('w-[var(--button-height-md)]');
  });
});
