import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: 'dh3drirod',
  api_key:    '612422952835258',
  api_secret: 'M61VjZIsQVIYZWW6-idrLou8qk8',
});

export { cloudinary };
export default cloudinary.v2;