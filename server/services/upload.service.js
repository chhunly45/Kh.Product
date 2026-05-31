const { Image, Product } = require('../models');
const cloudinary = require('../config/cloudinary');

const uploadStream = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
};

const createImages = async (userId, files, productId) => {
  if (productId) {
    await Product.findById(productId).orFail();
  }

  const createdImages = await Promise.all(files.map(async (file) => {
    const result = await uploadStream(file.buffer, {
      folder: `marketplace/${productId || 'tmp'}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    const image = await Image.create({
      product: productId || null,
      uploadedBy: userId,
      url: result.secure_url || result.url,
      secureUrl: result.secure_url || result.url,
      publicId: result.public_id,
      altText: file.originalname,
      sortOrder: 0
    });

    if (productId) {
      await Product.findByIdAndUpdate(productId, { $push: { images: image._id } });
    }

    return image;
  }));

  return createdImages;
};

const deleteImage = async (user, imageId) => {
  const image = await Image.findById(imageId);
  if (!image) {
    const error = new Error('Image not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = image.uploadedBy.toString() === user.id.toString();
  const isAdmin = ['admin', 'moderator'].includes(user.role);
  if (!isOwner && !isAdmin) {
    const error = new Error('Permission denied');
    error.statusCode = 403;
    throw error;
  }

  if (image.publicId) {
    await cloudinary.uploader.destroy(image.publicId, { resource_type: 'image' });
  }

  if (image.product) {
    await Product.findByIdAndUpdate(image.product, { $pull: { images: image._id } });
  }

  await image.deleteOne();
};

module.exports = {
  createImages,
  deleteImage
};
