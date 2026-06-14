import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../components/marketplace/ProductCard';

describe('ProductCard', () => {
  it('renders the product card with title, price, and category', () => {
    render(
      <MemoryRouter>
        <ProductCard id="123" title="Test Product" price="KHR 500,000" location="Phnom Penh" category="Electronics" />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/KHR\s*500,000/)).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/123');
  });
});
