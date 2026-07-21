const cloudinary = require('cloudinary').v2;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadToCloudinary = async (fileBuffer, folder = 'codearena') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Return mock URL if Cloudinary credentials not configured
    return `https://via.placeholder.com/300x300.png?text=CodeArena+Asset`;
  }
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    }).end(fileBuffer);
  });
};

module.exports = { cloudinary, uploadToCloudinary };
