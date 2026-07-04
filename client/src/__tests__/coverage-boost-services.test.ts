import api from '../services/api';
import * as trafficAnalyticsApi from '../services/traffic-analytics.api';
import * as promotionApi from '../services/promotion.api';
import * as revenueApi from '../services/revenue.api';
import * as productApi from '../services/product.api';
import * as bannerApi from '../services/banner.api';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), put: jest.fn(), delete: jest.fn() }
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('coverage boost for small service modules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('covers traffic analytics endpoints with default and provided params', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: { ok: true } } } as any);

    const metrics = await trafficAnalyticsApi.getTrafficMetrics('2024-01-01', '2024-01-31');
    const search = await trafficAnalyticsApi.getSearchAnalytics(7, '2024-01-01', '2024-01-31');
    const topContent = await trafficAnalyticsApi.getTopContent(undefined, '2024-01-01', '2024-01-31');
    const trends = await trafficAnalyticsApi.getTrafficTrends('weekly', 12, '2024-01-01', '2024-01-31');
    const growth = await trafficAnalyticsApi.getSearchGrowth('monthly', 5);
    const visitorGrowth = await trafficAnalyticsApi.getVisitorGrowth();
    const insights = await trafficAnalyticsApi.getTrafficInsights();

    expect(metrics).toEqual({ ok: true });
    expect(search).toEqual({ ok: true });
    expect(topContent).toEqual({ ok: true });
    expect(trends).toEqual({ ok: true });
    expect(growth).toEqual({ ok: true });
    expect(visitorGrowth).toEqual({ ok: true });
    expect(insights).toEqual({ ok: true });
    expect(mockedApi.get).toHaveBeenCalledTimes(7);
  });

  it('covers promotion admin and seller flows', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: [{ _id: 'p1' }] } } as any);
    mockedApi.post.mockResolvedValue({ data: { data: { purchased: true } } } as any);
    mockedApi.patch.mockResolvedValue({ data: { data: { ok: true } } } as any);

    const plans = await promotionApi.getPromotionPlans();
    const purchase = await promotionApi.purchasePromotion('prod-1', 'plan-1');
    const sellerPromos = await promotionApi.getSellerPromotions();
    const adminPromos = await promotionApi.getAdminPromotions({ page: 1 });
    const metrics = await promotionApi.getAdminPromotionMetrics();
    const approve = await promotionApi.approvePromotion('promo-1');
    const reject = await promotionApi.rejectPromotion('promo-1', 'spam');
    const extend = await promotionApi.extendPromotion('promo-1', 3);
    const cancel = await promotionApi.cancelPromotion('promo-1');

    expect(plans).toEqual([{ _id: 'p1' }]);
    expect(purchase).toEqual({ purchased: true });
    expect(sellerPromos).toEqual([{ _id: 'p1' }]);
    expect(adminPromos).toEqual([{ _id: 'p1' }]);
    expect(metrics).toEqual([{ _id: 'p1' }]);
    expect(approve).toEqual({ ok: true });
    expect(reject).toEqual({ ok: true });
    expect(extend).toEqual({ ok: true });
    expect(cancel).toEqual({ ok: true });
  });

  it('covers revenue endpoints and banner helpers', async () => {
    mockedApi.get.mockResolvedValue({ data: { data: { total: 42 } } } as any);
    mockedApi.post.mockResolvedValue({ data: { data: { banner: true } } } as any);
    mockedApi.patch.mockResolvedValue({ data: { data: { updated: true } } } as any);
    mockedApi.delete.mockResolvedValue({ data: { data: { removed: true } } } as any);

    const metrics = await revenueApi.getRevenueMetrics();
    const daily = await revenueApi.getDailyRevenue({ range: '7d' });
    const weekly = await revenueApi.getWeeklyRevenue();
    const monthly = await revenueApi.getMonthlyRevenue({ range: '30d' });
    const bySeller = await revenueApi.getRevenueBySeller();
    const active = await bannerApi.getActiveBanners('bottom');
    const list = await bannerApi.listBanners();
    const create = await bannerApi.createBanner({ title: 'x' });
    const update = await bannerApi.updateBanner('b1', { title: 'y' });
    const remove = await bannerApi.deleteBanner('b1');

    expect(metrics).toEqual({ total: 42 });
    expect(daily).toEqual({ total: 42 });
    expect(weekly).toEqual({ total: 42 });
    expect(monthly).toEqual({ total: 42 });
    expect(bySeller).toEqual({ total: 42 });
    expect(active).toEqual({ data: { total: 42 } });
    expect(list).toEqual({ data: { total: 42 } });
    expect(create).toEqual({ data: { banner: true } });
    expect(update).toEqual({ data: { updated: true } });
    expect(remove).toEqual({ data: { removed: true } });
  });

  it('covers product helpers that were previously under-tested', async () => {
    mockedApi.post.mockResolvedValue({ data: { data: { ok: true } } } as any);
    mockedApi.get.mockResolvedValue({ data: { data: { ok: true } } } as any);
    mockedApi.put.mockResolvedValue({ data: { data: { ok: true } } } as any);
    mockedApi.delete.mockResolvedValue({ data: { data: { ok: true } } } as any);

    const created = await productApi.createProduct({ title: 'x' });
    const uploaded = await productApi.uploadProductImages('p1', [new File(['x'], 'x.png', { type: 'image/png' })]);
    const products = await productApi.getProducts({ page: '1' });
    const featured = await productApi.getFeaturedProducts();
    const tracked = await productApi.trackProductView('p1');
    const updated = await productApi.updateProduct('p1', { title: 'y' });
    const deleted = await productApi.deleteProduct('p1');
    const byId = await productApi.getProductById('p1');
    const bySlug = await productApi.getProductBySlug('slug');
    const imageDeleted = await productApi.deleteProductImage('img1');

    expect(created).toEqual({ ok: true });
    expect(uploaded).toEqual({ ok: true });
    expect(products).toEqual({ ok: true });
    expect(featured).toEqual({ ok: true });
    expect(tracked).toEqual({ ok: true });
    expect(updated).toEqual({ ok: true });
    expect(deleted).toEqual({ data: { ok: true } });
    expect(byId).toEqual({ ok: true });
    expect(bySlug).toEqual({ ok: true });
    expect(imageDeleted).toEqual({ data: { ok: true } });
  });
});
