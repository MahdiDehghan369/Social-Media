const express = require('express');
const controller = require('./user.controller');
const authMiddleware = require("../../middlewares/auth");
const {multerStorage} = require("../../middlewares/uploaderConfigs");

const router = express.Router()

const upload = multerStorage("public/images/profiles")

router.route("/edit-profile").get(authMiddleware , controller.getEditProfilePage);
router.route("/update-profile").post(authMiddleware , upload.single("profile") , controller.updateProfile)
module.exports = router