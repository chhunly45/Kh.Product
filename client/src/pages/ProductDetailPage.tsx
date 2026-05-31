import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductById, deleteProductImage } from '../services/product.api';
import SEO from '../components/SEO';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        setStatus('Unable to load product.');
      }
    };
    loadProduct();
  }, [id]);

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteProductImage(imageId);
      if (product) {
        setProduct({
          ...product,
          images: product.images.filter((image: any) => image._id !== imageId)
        });
      }
    } catch (error) {
      setStatus('Failed to delete image');
    }
  };

  if (!product) {
    return <div className="p-8 text-center text-slate-600">{status || 'Loading product details...'}</div>;
  }

  return (
    <>
      <SEO
        title={product.title}
        description={product.description}
        url={window.location.href}
        image={product.images?.[0]?.secureUrl || product.images?.[0]?.url || 'https://via.placeholder.com/1200x630.png?text=Marketplace+Kh'}
        type="product"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          image: [product.images?.[0]?.secureUrl || product.images?.[0]?.url || 'https://via.placeholder.com/1200x630.png?text=Marketplace+Kh'],
          description: product.description,
          sku: product._id,
          brand: {
            '@type': 'Brand',
            name: product.category?.name || 'Marketplace Kh'
          },
          offers: {
            '@type': 'Offer',
            url: window.location.href,
            priceCurrency: 'KHR',
            price: product.price,
            availability: product.status === 'published' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
          }
        }}
      />
      <div className="space-y-6 rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Product detail</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{product.title}</h1>
          <p className="mt-3 text-sm text-slate-500">Listing ID: {product._id}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">KHR {product.price.toLocaleString()}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-3xl bg-slate-100 p-5">
          {product.images && product.images.length > 0 ? (
            <div className="space-y-3">
              <img src={product.images[0].secureUrl || product.images[0].url} alt={product.images[0].altText || product.title} className="h-80 w-full rounded-3xl object-cover" />
              <div className="grid gap-3 sm:grid-cols-3">
                {product.images.slice(1, 4).map((image: any) => (
                  <div key={image._id} className="overflow-hidden rounded-3xl bg-white">
                    <img src={image.secureUrl || image.url} alt={image.altText || product.title} className="h-24 w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-80 rounded-3xl bg-slate-200" />
          )}

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Category:</span> {product.category?.name || 'N/A'}</p>
            <p><span className="font-semibold text-slate-900">Location:</span> {product.location || 'N/A'}</p>
            <p><span className="font-semibold text-slate-900">Condition:</span> {product.condition || 'N/A'}</p>
          </div>
          <Link to="/chat" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Contact seller
          </Link>
        </div>

        <section className="space-y-6">
          <div className="rounded-3xl bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Product overview</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Seller information</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-sky-100">
                {product.seller?.profileImageUrl ? (
                  <img src={product.seller.profileImageUrl} alt={product.seller.displayName} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">{product.seller?.displayName || 'Seller'}</p>
                <p className="text-sm text-slate-500">{product.seller?.location || 'Local seller'}</p>
              </div>
            </div>
          </div>

          {product.images && product.images.length > 0 && (
            <div className="rounded-3xl bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">Gallery</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {product.images.map((image: any) => (
                  <div key={image._id} className="relative overflow-hidden rounded-3xl bg-white">
                    <img src={image.secureUrl || image.url} alt={image.altText || product.title} className="h-48 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image._id)}
                      className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white hover:bg-black"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {status && <p className="text-sm text-slate-600">{status}</p>}
    </div>
    </>
  );
};

export default ProductDetailPage;
