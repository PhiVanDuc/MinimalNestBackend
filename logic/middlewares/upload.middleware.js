const multer = require('multer');
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh!', 400), false);
  }
};

const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 100
  }
});

const handleMultiPartFormData = (fieldName) => {
  return upload.single(fieldName);
};

module.exports = {
  handleMultiPartFormData
};