const multer = require('multer');
const fs = require("fs")
const path = require('path');

exports.multerStorage = (
  destination,
  allowedTypes = /jpeg|png|webp|jpg|mp4/
) => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const unique = Date.now() * Math.floor(Math.random() * 1e9);
      const ext = path.extname(file.originalname);

      cb(null , `${unique}${ext}`);
    },
  });

  const fileFilter = function (req, file, cb) {
    if (allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed !!"));
    }
  };

  const upload = multer({
    storage,
    limits: {
      fileSize: 512000000,
    },
    fileFilter,
  });

  return upload;
};