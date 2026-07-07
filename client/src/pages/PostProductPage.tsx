import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { createProduct, uploadProductImages, getProductById, updateProduct, deleteProductImage } from '../services/product.api';
import { getProvinces, getDistricts, Province, District } from '../services/location.api';

const PostProductPage = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const [title, setTitle] = useState('');
  const [titleKh, setTitleKh] = useState('');
  const [titleEn, setTitleEn] = useState('');
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
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [initialCoverImageId, setInitialCoverImageId] = useState<string | null>(null);
  const [selectedNewCoverIndex, setSelectedNewCoverIndex] = useState<number | null>(null);
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
        setTitleKh(product.titleKh || '');
        setTitleEn(product.titleEn || '');
        setDescription(product.description || '');
        setPrice(product.price ? String(product.price) : '');
        setLocation(product.location || '');
        setCategory(product.category?._id || '');
        setCondition(product.condition || 'used');
        setProvince(product.province || '');
        setDistrict(product.district || '');
        setExistingImages(product.images || []);
        setExistingImageCount(product.images?.length || 0);
        setCoverImageId(product.coverImage?._id || product.images?.[0]?._id || null);
        setInitialCoverImageId(product.coverImage?._id || product.images?.[0]?._id || null);
        setSelectedNewCoverIndex(null);
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

  const totalImageCount = existingImages.length + previews.length;

  const handleRemovePreview = (index: number) => {
    const currentTotal = existingImages.length + previews.length;
    if (currentTotal <= 1) {
      window.alert('ត្រូវការ​រូបភាពផលិតផល​យ៉ាងតិច​មួយ​រូប។ / At least one product image is required.');
      return;
    }

    const confirmed = window.confirm('លុប​រូបភាព​នេះ​ពី​ជួរ​បញ្ចូល​រូបភាព? / Delete this image from the upload queue?');
    if (!confirmed) return;

    setPreviews((current) => current.filter((_, idx) => idx !== index));
    setImages((current) => current.filter((_, idx) => idx !== index));

    if (selectedNewCoverIndex === index) {
      setSelectedNewCoverIndex(null);
      setCoverImageId(initialCoverImageId);
    } else if (selectedNewCoverIndex !== null && index < selectedNewCoverIndex) {
      setSelectedNewCoverIndex(selectedNewCoverIndex - 1);
    }
  };

  const handleDeleteExistingImage = async (imageId: string) => {
    const currentTotal = existingImages.length + previews.length;
    if (currentTotal <= 1) {
      window.alert('ត្រូវការ​រូបភាពផលិតផល​យ៉ាងតិច​មួយ​រូប។ / At least one product image is required.');
      return;
    }

    const confirmed = window.confirm('លុប​រូបភាព​នេះ? វានឹងលុបវាពីផលិតផល និង​មិនអាច​ស្ដារឡើងវិញ​បានទេ។ / Delete this image? This will remove it from the product and cannot be undone.');
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await deleteProductImage(imageId);
      const remainingImages = existingImages.filter((image) => image._id !== imageId);
      setExistingImages(remainingImages);
      setExistingImageCount(remainingImages.length);

      if (coverImageId === imageId) {
        if (remainingImages.length > 0) {
          setCoverImageId(remainingImages[0]._id);
        } else if (previews.length > 0) {
          setSelectedNewCoverIndex(0);
          setCoverImageId(null);
        } else {
          setCoverImageId(null);
        }
      }

      setStatus('រូបភាពត្រូវបានលុបចេញពីបញ្ជី / Image removed from listing.');
    } catch (error) {
      console.error('Failed to delete existing image:', error);
      setStatus('មិនអាចលុបរូបភាពបាន។ សូមព្យាយាមម្តងទៀត។ / Unable to remove image. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const hasTitleKh = titleKh.trim().length > 0;
    const hasTitleEn = titleEn.trim().length > 0;
    const hasTitle = title.trim().length > 0;
    
    // Require at least one title (Khmer, English, or fallback title)
    if (!hasTitleKh && !hasTitleEn && !hasTitle) {
      nextErrors.title = 'Please provide at least one title (Khmer, English, or both)';
    }
    
    if (!description.trim()) nextErrors.description = 'Description is required';
    if (!price || Number(price) <= 0) nextErrors.price = 'Price must be a positive number';
    if (!location.trim()) nextErrors.location = 'Location is required';
    if (!category) nextErrors.category = 'ប្រភេទផលិតផលត្រូវបានទាមទារ / Category is required';
    if (!condition) nextErrors.condition = 'ស្ថានភាពត្រូវបានទាមទារ / Condition is required';
    if (!province) nextErrors.province = 'រាជធានី ឬ ខេត្ត ត្រូវបានទាមទារ / Province is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      setStatus('សូមត្រួតពិនិត្យចំណុចដែលបានពណ៌ស។ / Please fix the highlighted fields.');
      return;
    }

    setStatus(isEditing ? 'កំពុងកែប្រែបញ្ជី...' : 'កំពុងផ្សព្វផ្សាយផលិតផល...');
    setIsSubmitting(true);

    const payload: any = {
      title,
      titleKh,
      titleEn,
      description,
      price: Number(price),
      location,
      category,
      condition,
      province: province ? Number(province) : undefined,
      district: district ? Number(district) : undefined,
      coverImage: coverImageId || undefined
    };

    try {
      let product;
      if (isEditing && productId) {
        product = await updateProduct(productId, payload);
        setStatus('បញ្ជីរបស់អ្នកត្រូវបានអាប់ដេតដោយជោគជ័យ។ / Your listing was updated successfully.');
      } else {
        product = await createProduct(payload);
        setStatus('ផលិតផលរបស់អ្នកត្រូវបានផ្សព្វផ្សាយដោយជោគជ័យ។ / Your product was published successfully.');
      }

      if (images.length && product?._id) {
        const uploadedImages = await uploadProductImages(product._id, images);
        if (selectedNewCoverIndex != null && uploadedImages[selectedNewCoverIndex]) {
          payload.coverImage = uploadedImages[selectedNewCoverIndex]._id;
          await updateProduct(product._id, { coverImage: payload.coverImage });
        }
      }

      setSavedProductId(product?.slug || product?._id || null);
      if (!isEditing) {
        setTitle('');
        setTitleKh('');
        setTitleEn('');
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
      setStatus('មិនអាចរក្សាបញ្ជីរបស់អ្នកបាន។ សូមព្យាយាមម្តងទៀត។ / Unable to save your listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-border">
      <div className="space-y-3">
        {isEditing && (
          <p className="text-sm uppercase tracking-[0.35em] text-primary">កែសម្រួលការផ្សព្វផ្សាយ / Edit listing</p>
        )}
        <h1 className="text-3xl font-semibold text-text-primary">{isEditing ? 'កែប្រែផលិតផលរបស់អ្នក / Update your product' : 'បង្ហោះផលិតផលរបស់អ្នក / Post your product'}</h1>
        <p className="text-sm text-muted">ចែករំលែកផលិតផលរបស់អ្នកទៅកាន់អ្នកទិញក្នុងស្រុកបានយ៉ាងឆាប់រហ័ស / Share your product with thousands of local buyers quickly.</p>
      </div>

      <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">ចំណងជើងផលិតផល (ខ្មែរ) / Product title (Khmer)</span>
            <input
              value={titleKh}
              onChange={(event) => setTitleKh(event.target.value)}
              placeholder="ចំណងជើងផលិតផល (ខ្មែរ) / Product title (Khmer)"
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.title ? 'border-rose-400 bg-rose-50' : 'border-muted bg-background'}`}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text-secondary">ចំណងជើងផលិតផល (អង់គ្លេស) / Product title (English)</span>
            <input
              value={titleEn}
              onChange={(event) => setTitleEn(event.target.value)}
              placeholder="ចំណងជើងផលិតផល (អង់គ្លេស) / Product title (English)"
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.title ? 'border-rose-400 bg-rose-50' : 'border-muted bg-background'}`}
            />
          </label>
        </div>

        {errors.title && <p className="text-sm text-rose-600">{errors.title}</p>}

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">ចំណងជើងជំនួស / Fallback title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="ចំណងជើងជំនួស / Fallback title"
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 border-muted bg-background opacity-75`}
            />
            <p className="mt-2 text-xs text-muted">ស្រេចចិត្ត — ប្រើតែនៅពេលគ្មានចំណងជើងខ្មែរ ឬអង់គ្លេស / Optional — used if no Khmer/English titles are available.</p>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text-secondary">ប្រភេទផលិតផល / Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.category ? 'border-rose-400 bg-rose-50' : 'border-muted bg-background'}`}
            >
              <option value="">ជ្រើសរើសប្រភេទ / Select category</option>
              {categories.map((item) => (
                <option key={item._id} value={item._id}>{item.labelKh || item.name}</option>
              ))}
            </select>
            {errors.category && <p className="mt-2 text-sm text-rose-600">{errors.category}</p>}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-text-secondary">ការពិពណ៌នា / Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            placeholder="សរសេរការពិពណ៌នាអំពីផលិតផល / Describe your product"
            className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.description ? 'border-rose-400 bg-rose-50' : 'border-muted bg-background'}`}
          />
          {errors.description && <p className="mt-2 text-sm text-rose-600">{errors.description}</p>}
        </label>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">តម្លៃ (ដុល្លារ USD) / Price (USD)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="បញ្ចូលតម្លៃជាដុល្លារ / Enter price in USD"
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.price ? 'border-rose-400 bg-rose-50' : 'border-muted bg-background'}`}
            />
            {errors.price && <p className="mt-2 text-sm text-rose-600">{errors.price}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text-secondary">ទីតាំង / Location</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="បញ្ចូលទីតាំង / Enter location"
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.location ? 'border-rose-400 bg-rose-50' : 'border-muted bg-background'}`}
            />
            {errors.location && <p className="mt-2 text-sm text-rose-600">{errors.location}</p>}
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">ស្ថានភាពផលិតផល / Condition</span>
            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.condition ? 'border-rose-400 bg-rose-50' : 'border-muted bg-background'}`}
            >
              <option value="">ជ្រើសរើសស្ថានភាព / Select condition</option>
              <option value="new">ថ្មី / New</option>
              <option value="used">ប្រើរួច / Used</option>
              <option value="refurbished">ធ្វើឡើងវិញ / Refurbished</option>
            </select>
            {errors.condition && <p className="mt-2 text-sm text-rose-600">{errors.condition}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">រាជធានី ឬ ខេត្ត / Province</span>
            <select
              value={province}
              onChange={(event) => setProvince(event.target.value ? Number(event.target.value) : '')}
              className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.province ? 'border-rose-400 bg-rose-50' : 'border-muted bg-background'}`}
            >
              <option value="">ជ្រើសរើសរាជធានី ឬ ខេត្ត / Select province</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.nameKh || prov.name}
                </option>
              ))}
            </select>
            {errors.province && <p className="mt-2 text-sm text-rose-600">{errors.province}</p>}
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">រូបភាពផលិតផល / Product images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="mt-2 w-full text-sm text-text-secondary"
              aria-label="ជ្រើសរើសរូបភាព / Choose Files"
              title="ជ្រើសរើសរូបភាព / Choose Files"
            />
            <p className="mt-2 text-xs text-muted">អាចបង្ហោះរូបភាពថ្មីបានរហូតដល់ ៦ រូប។ រូបភាពនឹងត្រូវបានកែលម្អដោយស្វ័យប្រវត្តិ។ / Upload up to 6 new images. Images will be optimized automatically.</p>
            {isEditing && existingImageCount > 0 && (
              <p className="mt-2 text-xs text-muted">បញ្ជីនេះមានរូបភាពដែលមានស្រាប់ {existingImageCount} រូប។ ការបង្ហោះរូបភាពថ្មីនឹងបន្ថែមទៅក្នុងចំណតរូបភាព។ / This listing already has {existingImageCount} existing image{existingImageCount > 1 ? 's' : ''}. Uploading new images will add to the gallery.</p>
            )}
          </label>
        </div>

        {existingImages.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-text-secondary">រូបភាពដែលមានស្រាប់ / Existing images</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {existingImages.map((image, index) => {
                const src = image.secureUrl || image.url;
                const isCover = coverImageId === image._id;
                return (
                  <div
                    key={image._id}
                    className={`group relative overflow-hidden rounded-3xl border ${isCover ? 'border-primary' : 'border-transparent'} bg-background focus-within:ring-2 focus-within:ring-primary/30`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImageId(image._id);
                        setSelectedNewCoverIndex(null);
                      }}
                      className="absolute inset-0 z-0"
                      aria-label={`ជ្រើស existing image ${index + 1} ជា​មុខក្បាល / Select existing image ${index + 1} as cover`}
                    />
                    <img src={src} alt={`រូបភាពដែលមានស្រាប់ ${index + 1} / Existing image ${index + 1}`} className="h-28 w-full object-cover" />
                    <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-primary">
                      {isCover ? 'មុខក្បាល / Cover' : 'កំណត់ជារូបភាពគម្រប / Set cover'}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteExistingImage(image._id);
                      }}
                      disabled={totalImageCount <= 1}
                      className={`absolute right-2 top-2 z-20 rounded-full px-2 py-1 text-xs font-semibold transition ${totalImageCount <= 1 ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
                      aria-label={`លុប​រូបភាព​មាន​ស្រាប់ ${index + 1} / Delete existing image ${index + 1}`}
                    >
                      លុប / Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {previews.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-text-secondary">ការបង្ហោះថ្មី / New uploads</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {previews.map((preview, index) => {
                const isCover = selectedNewCoverIndex === index && coverImageId === null;
                return (
                  <div key={`${preview}-${index}`} className="group relative overflow-hidden rounded-3xl bg-background">
                    <img src={preview} alt={`Preview ${index + 1}`} className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNewCoverIndex(index);
                        setCoverImageId(null);
                      }}
                      className={`absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-primary ${isCover ? 'border border-primary' : ''}`}
                    >
                      {isCover ? 'មុខក្បាល / Cover' : 'កំណត់ជារូបភាពគម្រប / Set cover'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePreview(index)}
                      disabled={existingImages.length + previews.length <= 1}
                      className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-semibold transition ${existingImages.length + previews.length <= 1 ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-80' : 'bg-black/70 text-white opacity-0 group-hover:opacity-100 hover:bg-black'}`}
                    >
                      ដកចេញ / Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {status && <p className="text-sm text-text-secondary">{status}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (isEditing ? 'កំពុងកែប្រែ...' : 'កំពុងផ្សព្វផ្សាយ...') : (isEditing ? 'កែប្រែបញ្ជី / Update listing' : 'ផ្សព្វផ្សាយបញ្ជី / Publish listing')}
          </button>
          {savedProductId && (
            <button
              type="button"
              onClick={() => navigate(`/products/${savedProductId}`)}
              className="rounded-3xl border border-muted bg-white px-6 py-3 text-sm font-semibold text-text-secondary hover:bg-background transition"
            >
              មើលបញ្ជី / View listing
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PostProductPage;


