import React from 'react';
import { render, screen } from '@testing-library/react';
import FeaturedSection from '../components/marketplace/FeaturedSection';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../components/marketplace/ProductCard', () => () => <div data-testid="product-card" />);

describe('FeaturedSection', () => {
  test('renders title and description and view all link', () => {
    render(
      <MemoryRouter>
        <FeaturedSection title="Featured" description="Top picks" products={[]} viewAllLink="/all" />
      </MemoryRouter>
    );
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('Top picks')).toBeInTheDocument();
    expect(screen.getByText(/View all/i)).toBeInTheDocument();
  });

  test('renders product cards for populated products', () => {
    const products = [{ _id: 'p1', title: 'P1', price: 10 }];
    render(
      <MemoryRouter>
        <FeaturedSection title="Featured" products={products} />
      </MemoryRouter>
    );
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByTestId('product-card')).toBeInTheDocument();
  });

  test('handles empty products array', () => {
    render(
      <MemoryRouter>
        <FeaturedSection title="Empty" products={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
  });

  test('renders product card using slug when _id is not present', () => {
    const products = [{ slug: 'product-slug', title: 'Slug Product', price: 10, category: 'General' }];
    render(
      <MemoryRouter>
        <FeaturedSection title="Featured" products={products} />
      </MemoryRouter>
    );
    expect(screen.getByTestId('product-card')).toBeInTheDocument();
  });

  test('renders product card using id fallback when slug and _id are missing', () => {
    const products = [{ id: 'product-id', title: 'ID Product', price: 20, category: 'General' }];
    render(
      <MemoryRouter>
        <FeaturedSection title="Featured" products={products} />
      </MemoryRouter>
    );
    expect(screen.getByTestId('product-card')).toBeInTheDocument();
  });
});
