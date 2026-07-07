import { act, render, screen, waitFor } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';
import SellerHero from '../components/marketplace/SellerHero';
import SellerSidebar from '../components/marketplace/SellerSidebar';
import SellerStats from '../components/marketplace/SellerStats';
import TopAdBanner from '../components/marketplace/TopAdBanner';
import * as bannerApi from '../services/banner.api';

jest.mock('../components/marketplace/SellerContactCard', () => ({
  __esModule: true,
  default: ({ sellerName, sellerPhone, sellerEmail }: { sellerName?: string; sellerPhone?: string; sellerEmail?: string }) => (
    <div data-testid="seller-contact-card">
      <span>{sellerName}</span>
      <span>{sellerPhone}</span>
      <span>{sellerEmail}</span>
    </div>
  )
}));

jest.mock('../services/banner.api', () => ({
  getActiveBanners: jest.fn()
}));

const mockedGetActiveBanners = bannerApi.getActiveBanners as jest.MockedFunction<typeof bannerApi.getActiveBanners>;

describe('high-impact component coverage', () => {
  beforeEach(() => {
    mockedGetActiveBanners.mockReset();
  });

  it('renders the error boundary fallback when a child throws', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const Bomb = () => {
      throw new Error('boom');
    };

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('renders seller hero details with profile fallbacks and optional chips', () => {
    render(
      <SellerHero
        profile={{ displayName: 'Ali', location: 'Phnom Penh', createdAt: '2024-01-01' }}
        avatarImage="avatar.png"
        coverImage="cover.png"
        username="@ali"
        verificationStatusLabel="Verified"
        memberSinceLabel="Since 2024"
      />
    );

    expect(screen.getByRole('heading', { name: /Ali/i })).toBeInTheDocument();
    expect(screen.getByText('@ali')).toBeInTheDocument();
    expect(screen.getByText('Phnom Penh')).toBeInTheDocument();
    expect(screen.getAllByText('Verified').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Since 2024').length).toBeGreaterThan(0);
    expect(screen.getByAltText('Ali avatar')).toBeInTheDocument();
    expect(screen.getByAltText('Ali cover')).toBeInTheDocument();
  });

  it('renders seller hero fallback alt text and hides optional chips when profile fields are missing', () => {
    render(
      <SellerHero
        profile={{}}
        avatarImage="avatar.png"
        coverImage="cover.png"
        username="@nope"
        verificationStatusLabel="Verified"
        memberSinceLabel="Since 2024"
      />
    );

    expect(screen.getByAltText('Seller avatar')).toBeInTheDocument();
    expect(screen.getByAltText('Seller cover')).toBeInTheDocument();
    expect(screen.queryByText('Phnom Penh')).not.toBeInTheDocument();
    expect(screen.getByText('@nope')).toBeInTheDocument();
  });

  it('renders seller sidebar actions and contact card for owners', () => {
    const startEdit = jest.fn();
    const setActiveTab = jest.fn();

    render(
      <SellerSidebar
        profile={{ displayName: 'Mina', phoneNumber: '+855123', email: 'mina@example.com' }}
        isOwner={true}
        completionPercentage={75}
        completionTone="from-teal-500 to-emerald-500"
        completionChecks={[]}
        startEdit={startEdit}
        setActiveTab={setActiveTab}
        profileUi={{ storeCompletion: 'Store Completion', completionHint: 'Almost done', editProfile: 'Edit profile', products: 'Products' }}
      />
    );

    expect(screen.getByText('Store Completion')).toBeInTheDocument();
    expect(screen.getByText('Almost done')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByTestId('seller-contact-card')).toHaveTextContent('Mina');
  });

  it('renders seller stats cards with the provided values', () => {
    render(<SellerStats stats={{ totalProducts: 12, totalViews: 321, favoritesCount: 44 }} memberSinceLabel="Jan 2024" />);

    expect(screen.getByText('Verified Seller')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Profile Views')).toBeInTheDocument();
    expect(screen.getByText('321')).toBeInTheDocument();
    expect(screen.getByText('Member Since')).toBeInTheDocument();
    expect(screen.getByText('Jan 2024')).toBeInTheDocument();
  });

  it('renders only the artwork and keeps the banner clickable when linked', async () => {
    mockedGetActiveBanners.mockResolvedValueOnce({ data: [{ title: 'Summer Sale', subtitle: 'Big discounts', imageUrl: 'banner.png', linkUrl: '/sale' }] } as any);

    render(<TopAdBanner imageUrl="fallback.png" />);

    await waitFor(() => expect(screen.getByRole('img', { name: /Summer Sale/i })).toBeInTheDocument());
    expect(screen.queryByText('Summer Sale')).not.toBeInTheDocument();
    expect(screen.queryByText('Big discounts')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /contact us/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Promotional banner: Summer Sale/i })).toHaveAttribute('href', '/sale');
  });

  it('renders the default ad artwork placeholder when no banner exists', async () => {
    mockedGetActiveBanners.mockResolvedValueOnce({ data: [] } as any);

    render(<TopAdBanner imageUrl="fallback.png" link="/contact" />);

    await waitFor(() => expect(screen.getByRole('img', { name: /ad/i })).toBeInTheDocument());
    expect(screen.queryByText('Advertise with Konpuk')).not.toBeInTheDocument();
    expect(screen.queryByText('Promote your products to thousands of local buyers')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Promotional banner/i })).toHaveAttribute('href', '/contact');
  });

  it('renders a clickable fallback link when no image URL exists but a link is provided', async () => {
    mockedGetActiveBanners.mockResolvedValueOnce({ data: [{ title: 'Banner Without Image', subtitle: 'Still shows fallback', imageUrl: undefined, linkUrl: undefined }] } as any);

    render(<TopAdBanner imageUrl="fallback.png" link="/contact" />);

    await waitFor(() => expect(screen.getByRole('img', { name: /ad/i })).toBeInTheDocument());
    expect(screen.queryByText('Banner Without Image')).not.toBeInTheDocument();
    expect(screen.queryByText('Still shows fallback')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Promotional banner/i })).toHaveAttribute('href', '/contact');
  });

  it('renders a non-clickable artwork when no link exists', async () => {
    mockedGetActiveBanners.mockResolvedValueOnce({ data: [{ title: 'No Link', subtitle: 'No click', imageUrl: 'banner.png' }] } as any);

    render(<TopAdBanner />);

    await waitFor(() => expect(screen.getByRole('img', { name: /No Link/i })).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /Promotional banner: No Link/i })).not.toBeInTheDocument();
  });

  it('renders the placeholder when the banner API returns null data', async () => {
    mockedGetActiveBanners.mockResolvedValueOnce({ data: null } as any);

    render(<TopAdBanner imageUrl="fallback.png" link="/contact" />);

    await waitFor(() => expect(screen.getByAltText('ad')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Promotional banner/i })).toHaveAttribute('href', '/contact');
  });

  it('preserves placeholder state when the banner API rejects', async () => {
    mockedGetActiveBanners.mockRejectedValueOnce(new Error('Network failure'));

    render(<TopAdBanner imageUrl="fallback.png" link="/contact" />);

    await waitFor(() => expect(screen.getByAltText('ad')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Promotional banner/i })).toHaveAttribute('href', '/contact');
  });

  it('does not attempt to update state after unmount when banner promise resolves late', async () => {
    let resolvePromise: (value: any) => void;
    const bannerPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockedGetActiveBanners.mockReturnValueOnce(bannerPromise as any);

    const { unmount } = render(<TopAdBanner imageUrl="fallback.png" link="/contact" />);
    unmount();

    await act(async () => {
      resolvePromise!({ data: [{ title: 'Delayed Banner', subtitle: 'Should not render', imageUrl: 'delayed.png', linkUrl: '/delayed' }] });
    });

    expect(screen.queryByText('Delayed Banner')).not.toBeInTheDocument();
  });

  it('falls back to a placeholder image when no banner and no link prop are provided', async () => {
    mockedGetActiveBanners.mockResolvedValueOnce({ data: [] } as any);

    render(<TopAdBanner />);

    await waitFor(() => expect(screen.getByText('Ad image')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /Promotional banner/i })).not.toBeInTheDocument();
  });
});
