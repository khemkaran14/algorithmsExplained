import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
describe('Button', () => {
  it('supports keyboard-native button semantics and handlers', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Continue</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it('renders a link without nesting interactive elements', () => {
    render(
      <Button asChild>
        <a href="/learn">Start</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Start' })).toHaveAttribute(
      'href',
      '/learn',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
