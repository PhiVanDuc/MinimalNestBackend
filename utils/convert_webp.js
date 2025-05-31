const sharp = require('sharp');

const MAX_RESOLUTION = 2048; // Giới hạn 2K

const convertToWebp = async (buffer, options = {}) => {
    try {
        const metadata = await sharp(buffer).metadata();
        
        let resizeOptions = null;
        if (Math.max(metadata.width, metadata.height) > MAX_RESOLUTION) {
            const ratio = Math.min(
                MAX_RESOLUTION / metadata.width,
                MAX_RESOLUTION / metadata.height
            );
            resizeOptions = {
                width: Math.floor(metadata.width * ratio),
                height: Math.floor(metadata.height * ratio),
                fit: 'inside',
                withoutEnlargement: true
            };
        } else if (options.resize) {
            resizeOptions = options.resize;
        }

        const pipeline = sharp(buffer);
        if (resizeOptions) pipeline.resize(resizeOptions);

        return await pipeline
            .webp({ 
                quality: options.quality || 85,
                alphaQuality: options.alphaQuality || 90
            })
            .toBuffer();
    } catch (err) {
        console.error('[Image Processing]', err);
        throw err; // Giữ nguyên stack trace
    }
};

module.exports = { convertToWebp, MAX_RESOLUTION };