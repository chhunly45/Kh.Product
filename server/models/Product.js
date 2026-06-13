const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const ProductSchema = new Schema({
  seller: { type: Types.ObjectId, ref: 'User', required: true },
  category: { type: Types.ObjectId, ref: 'Category', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'KHR', trim: true },
  condition: { type: String, enum: ['new', 'used', 'refurbished'], default: 'used' },
  location: { type: String, trim: true },
  province: { type: Number },
  district: { type: Number },
  status: { type: String, enum: ['draft', 'published', 'sold', 'archived', 'flagged'], default: 'published' },
  images: [{ type: Types.ObjectId, ref: 'Image' }],
  tags: { type: [{ type: String, trim: true }], default: [] },
  viewsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  featuredAt: { type: Date, default: null },
  metaTitle: { type: String, trim: true },
  metaDescription: { type: String, trim: true },
  locationRegion: { type: String, trim: true },
  extraAttributes: { type: Schema.Types.Mixed }
}, {
  timestamps: true,
  autoIndex: false
});

ProductSchema.index({ title: 'text', description: 'text' }, { background: true });
ProductSchema.index({ category: 1, location: 1, status: 1, condition: 1, price: 1 }, { background: true });
ProductSchema.index({ province: 1, district: 1, status: 1 }, { background: true });
ProductSchema.index({ createdAt: -1 }, { background: true });

module.exports = model('Product', ProductSchema);
