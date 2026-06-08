const Banner = require('../models/Banner');
const cloudinary = require('../config/cloudinary');

const getActiveBanners = async (req, res, next) => {
  try {
    const position = req.query.position || 'top';
    const now = new Date();
    const banners = await Banner.find({
      position,
      enabled: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: { $lte: now } }
      ],
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: now } }
      ]
    }).sort({ sortOrder: 1, createdAt: -1 });

    res.json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
};

const listBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
};

const createBanner = async (req, res, next) => {
  try {
    const payload = req.body;
    // Accept image info from body (imageUrl, imagePublicId) which is populated after upload
    const banner = await Banner.create({ ...payload, createdBy: req.user.id });
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const banner = await Banner.findByIdAndUpdate(id, payload, { new: true }).orFail();
    res.json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id).orFail();
    if (banner.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(banner.imagePublicId, { resource_type: 'image' });
      } catch (err) {
        console.warn('Failed to remove banner image from Cloudinary', err.message);
      }
    }
    await banner.deleteOne();
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveBanners,
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner
};
