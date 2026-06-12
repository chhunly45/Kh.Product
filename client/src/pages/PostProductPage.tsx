import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { createProduct, uploadProductImages, getProductById, updateProduct } from '../services/product.api';
import { getProvinces, getDistricts, Province, District } from '../services/location.api';

const PostProductPage = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('used');
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; labelKh?: string }>>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [province, setProvince] = useState<number | ''>('');
  const [district, setDistrict] = useState<number | ''>('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImageCount, setExistingImageCount] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedProductId, setSavedProductId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data || []);
        if (!productId && response.data.data && response.data.data.length > 0) {
          setCategory(response.data.data[0]._id);
        }
      } catch (error) {
        setStatus('Unable to load categories.');
      }
    };

    const loadProvinces = async () => {
      try {
        const provinceList = await getProvinces();
        setProvinces(provinceList);
      } catch (error) {
        console.error('Failed to load provinces:', error);
      }
    };

    const loadProduct = async () => {
      if (!productId) return;
      setIsEditing(true);
      setStatus('Loading listing for edit...');
      try {
        const product = await getProductById(productId);
        setTitle(product.title || '');
        setDescription(product.description || '');
        setPrice(product.price ? String(product.price) : '');
        setLocation(product.location || '');
        setCategory(product.category?._id || '');
        setCondition(product.condition || 'used');
        setProvince(product.province || '');
        setDistrict(product.district || '');
        setExistingImageCount(product.images?.length || 0);
        setStatus('');
        if (product.province) {
          try {
            const districtList = await getDistricts(product.province);
            setDistricts(districtList);
          } catch (error) {
            console.error('Failed to load districts:', error);
          }
        }
      } catch (error) {
        setStatus('Unable to load listing for edit.');
      }
    };

    loadCategories();
    loadProvinces();
    loadProduct();
  }, [productId]);

  useEffect(() => {
    const loadDistrictsForProvince = async () => {
      if (province) {
        try {
          const districtList = await getDistricts(province);
          setDistricts(districtList);
          setDistrict('');
        } catch (error) {
          console.error('Failed to load districts:', error);
        }
      } else {
        setDistricts([]);
        setDistrict('');
      }
    };

    loadDistrictsForProvince();
  }, [province]);

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles).slice(0, 6);
    setImages(fileArray);
    setPreviews((current) => [...current, ...fileArray.map((file) => URL.createObjectURL(file))].slice(0, 6));
  };

  const handleRemovePreview = (index: number) => {
    setPreviews((current) => current.filter((_, idx) => idx !== index));
    setImages((current) => current.filter((_, idx) => idx !== index));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = 'Product title is required';
    if (!description.trim()) nextErrors.description = 'Description is required';
    if (!price || Number(price) <= 0) nextErrors.price = 'Price must be a positive number';
    if (!location.trim()) nextErrors.location = 'Location is required';
    if (!category) nextErrors.category = 'Category is required';
    if (!condition) nextErrors.condition = 'Condition is required';
    if (!province) nextErrors.province = 'Province is required';
    if (!district) nextErrors.district = 'District is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      setStatus('Please fix the highlighted fields.');
      return;
    }

    setStatus(isEditing ? 'Updating listing...' : 'Publishing product...');
    setIsSubmitting(true);

    const payload = {
      title,
      description,
      price: Number(price),
      location,
      category,
      condition,
      province: province ? Number(province) : undefined,
      district: district ? Number(district) : undefined
    };

    try {
      let product;
      if (isEditing && productId) {
        product = await updateProduct(productId, payload);
        setStatus('Your listing was updated successfully.');
      } else {
        product = await createProduct(payload);
        setStatus('Your product was published successfully.');
      }

      if (images.length && product?._id) {
        await uploadProductImages(product._id, images);
      }

      setSavedProductId(product?._id || null);
      if (!isEditing) {
        setTitle('');
        setDescription('');
        setPrice('');
        setLocation('');
        setProvince('');
        setDistrict('');
        setDistricts([]);
        setCondition('used');
        setImages([]);
        setPreviews([]);
      }
    } catch (error) {
      console.error('PostProductPage submit error:', error);
      setStatus('Unable to save your listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-600">{isEditing ? 'Edit listing' : 'New listing'}</p>
        <h1 className="text-3xl font-semibold text-slate-900">{isEditing ? 'Update your product' : 'Post your product'}</h1>
        <p className="text-sm text-slate-500">Share your product with thousands of local buyers quickly.</p>
      </div>

      <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Product title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${errors.title ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
            />
            {errors.title && <p className="mt-2 text-sm text-rose-600">{errors.title}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${errors.category ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <option value="">Select category</option>
              {categories.map((item) => (
                <option key={item._id} value={item._id}>{item.labelKh || item.name}</option>
              ))}
            </select>
            {errors.category && <p className="mt-2 text-sm text-rose-600">{errors.category}</p>}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${errors.description ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
          />
          {errors.description && <p className="mt-2 text-sm text-rose-600">{errors.description}</p>}
        </label>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Price (USD)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Enter price in USD"
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${errors.price ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
            />
            {errors.price && <p className="mt-2 text-sm text-rose-600">{errors.price}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Location</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${errors.location ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
            />
            {errors.location && <p className="mt-2 text-sm text-rose-600">{errors.location}</p>}
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Condition</span>
            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${errors.condition ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
            {errors.condition && <p className="mt-2 text-sm text-rose-600">{errors.condition}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Province</span>
            <select
              value={province}
              onChange={(event) => setProvince(event.target.value ? Number(event.target.value) : '')}
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${errors.province ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <option value="">Select province</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
            {errors.province && <p className="mt-2 text-sm text-rose-600">{errors.province}</p>}
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">District</span>
            <select
              value={district}
              onChange={(event) => setDistrict(event.target.value ? Number(event.target.value) : '')}
              disabled={!province}
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${errors.district ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'} ${!province ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Select district</option>
              {districts.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.name}
                </option>
              ))}
            </select>
            {errors.district && <p className="mt-2 text-sm text-rose-600">{errors.district}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Product images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="mt-2 w-full text-sm text-slate-700"
            />
            <p className="mt-2 text-xs text-slate-500">Upload up to 6 new images. Images will be optimized automatically.</p>
            {isEditing && existingImageCount > 0 && (
              <p className="mt-2 text-xs text-slate-500">This listing already has {existingImageCount} existing image{existingImageCount > 1 ? 's' : ''}. Uploading new images will add to the gallery.</p>
            )}
          </label>
        </div>

        {previews.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {previews.map((preview, index) => (
              <div key={`${preview}-${index}`} className="group relative overflow-hidden rounded-3xl bg-slate-100">
                <img src={preview} alt={`Preview ${index + 1}`} className="h-28 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePreview(index)}
                  className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {status && <p className="text-sm text-slate-600">{status}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (isEditing ? 'Updating...' : 'Publishing...') : (isEditing ? 'Update listing' : 'Publish listing')}
          </button>
          {savedProductId && (
            <button
              type="button"
              onClick={() => navigate(`/products/${savedProductId}`)}
              className="rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              View listing
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PostProductPage;
