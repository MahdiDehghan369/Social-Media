const express = require('express')
const controller = require('./post.controller')
const authMiddleware = require("../../middlewares/auth");
const accountVerifyMiddleware = require("../../middlewares/accountVerify");
const {multerStorage} = require("../../middlewares/uploaderConfigs")

const router = express.Router()

const uploader = multerStorage("public/images/post", /jpeg|png|webp|jpg|mp4/);

router.route("/").get(authMiddleware , accountVerifyMiddleware ,controller.showPageCraetePost);
router
  .route("/")
  .post(authMiddleware, uploader.single("media") ,controller.createPost);

module.exports = router