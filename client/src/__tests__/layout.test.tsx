import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';

describe('AppShell layout', () => {
  it('renders header, children, and footer content', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <div>Test Content</div>
        </AppShell>
      </MemoryRouter>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText(/Test Content/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Home/i }).length).toBeGreaterThanOrEqual(1);
  });
});
