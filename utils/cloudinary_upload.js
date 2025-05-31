const cloudinary = require('./cloudinary');
const { convertToWebp, MAX_RESOLUTION } = require('./convert_webp');
const { Readable } = require('stream');

const uploadToCloudinary = async (buffer, options = {}) => {
    try {
        const webpBuffer = await convertToWebp(buffer, {
            resize: options.resize,
            quality: options.quality
        });

        const transformation = [
            { 
                width: options.resize?.width || MAX_RESOLUTION,
                height: options.resize?.height || MAX_RESOLUTION,
                crop: 'limit'
            },
            { quality: 'auto:best' }
        ];

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: options.folder,
                public_id: options.public_id,
                transformation,
                resource_type: 'image'
            }, (error, result) => {
                if (error) {
                    console.error('[Cloudinary Error]', error);
                    reject(error);
                } else {
                    console.log(`Uploaded ${result.public_id}`);
                    resolve(result);
                }
            });

            Readable.from(webpBuffer).pipe(uploadStream);
        });
    } catch (error) {
        console.error('[Upload Failed]', error);
        throw error;
    }
};

module.exports = uploadToCloudinary;