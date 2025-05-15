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


router.route("/like").post(authMiddleware , controller.like)
router.route("/dislike").post(authMiddleware , controller.disLike)

router.route("/save").post(authMiddleware , controller.save)
router.route("/unsave").post(authMiddleware , controller.unSave)

router.route("/saves").get(authMiddleware , controller.savesPost)

module.exports = router