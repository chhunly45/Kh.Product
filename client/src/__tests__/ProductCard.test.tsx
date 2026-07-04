import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../components/marketplace/ProductCard';

describe('ProductCard', () => {
  it('renders the product card with title, price, and category', () => {
    render(
      <MemoryRouter>
        <ProductCard id="123" titleEn="Test Product" price="KHR 500,000" location="Phnom Penh" category="Electronics" />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/KHR\s*500,000/)).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/123');
  });

  it('renders bilingual title when both titleKh and titleEn are provided', () => {
    render(
      <MemoryRouter>
        <ProductCard id="456" titleKh="ផលិតផល" titleEn="Product" price={1000} location="Phnom Penh" category="General" />
      </MemoryRouter>
    );

    expect(screen.getByText('ផលិតផល')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  it('toggles favorite state and calls onToggleFavorite', () => {
    const onToggleFavorite = jest.fn();

    render(
      <MemoryRouter>
        <ProductCard
          id="123"
          titleEn="Test Product"
          price={100}
          location="Phnom Penh"
          category="General"
          isFavorite={false}
          onToggleFavorite={onToggleFavorite}
        />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /Save to favorites/i });
    fireEvent.click(button);

    expect(onToggleFavorite).toHaveBeenCalledWith('123', false);
    expect(screen.getByRole('button', { name: /Remove from favorites/i })).toBeInTheDocument();
  });

  it('shows verified seller badge when seller is verified', () => {
    render(
      <MemoryRouter>
        <ProductCard
          id="999"
          titleEn="Verified Product"
          price={250}
          location="Phnom Penh"
          category="General"
          seller={{ sellerVerificationStatus: 'verified' }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('ផ្ទៀងផ្ទាត់')).toBeInTheDocument();
  });

  it('renders without a visible title when no title is provided', () => {
    render(
      <MemoryRouter>
        <ProductCard id="789" price={500} location="Phnom Penh" />
      </MemoryRouter>
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/789');
    expect(screen.queryByText('Product')).not.toBeInTheDocument();
  });
});
