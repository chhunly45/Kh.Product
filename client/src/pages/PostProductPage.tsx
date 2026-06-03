import { useEffect, useState } from 'react';
import api from '../services/api';
import { createProduct, uploadProductImages } from '../services/product.api';

const PostProductPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; labelKh?: string }>>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data || []);
        if (response.data.data && response.data.data.length > 0) {
          setCategory(response.data.data[0]._id);
        }
      } catch (error) {
        setStatus('Unable to load categories.');
      }
    };
    loadCategories();
  }, []);

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles).slice(0, 6);
    setImages(fileArray);
    setPreviews(fileArray.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Publishing product...');
    setIsSubmitting(true);

    try {
      const product = await createProduct({
        title,
        description,
        price: Number(price),
        location,
        category
      });

      if (images.length) {
        await uploadProductImages(product._id, images);
      }

      setStatus('Your product was published successfully.');
      setTitle('');
      setDescription('');
      setPrice('');
      setLocation('');
      setImages([]);
      setPreviews([]);
    } catch (error) {
      setStatus('Failed to publish product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-600">New listing</p>
        <h1 className="text-3xl font-semibold text-slate-900">Post your product</h1>
        <p className="text-sm text-slate-500">Share your product with thousands of local buyers quickly.</p>
      </div>

      <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Product title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              {categories.map((item) => (
                  <option key={item._id} value={item._id}>{item.labelKh || item.name}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            required
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Price</span>
            <input
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Location</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Product images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="mt-2 w-full text-sm text-slate-700"
          />
          <p className="mt-2 text-xs text-slate-500">Upload up to 6 images. Images will be optimized automatically.</p>
        </label>

        {previews.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {previews.map((preview) => (
              <div key={preview} className="overflow-hidden rounded-3xl bg-slate-100">
                <img src={preview} alt="Preview" className="h-28 w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {status && <p className="text-sm text-slate-600">{status}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Publishing...' : 'Publish listing'}
        </button>
      </form>
    </div>
  );
};

export default PostProductPage;
