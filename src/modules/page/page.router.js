const express = require("express");
const controller = require("./page.controller");
const authMiddleware = require("../../middlewares/auth");
const existsPageMiddleware = require("../../middlewares/existsPage");
const router = express.Router();

router
  .route("/:pageId")
  .get(authMiddleware, existsPageMiddleware, controller.getPage);
router.route("/:pageId/follow").post(authMiddleware, existsPageMiddleware, controller.follow);
router
  .route("/:pageId/unfollow")
  .post(authMiddleware, existsPageMiddleware , controller.unFollow);

module.exports = router;
