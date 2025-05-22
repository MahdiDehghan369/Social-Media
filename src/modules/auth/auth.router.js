const express = require('express');
const controller = require('./auth.controller');

const router = express.Router()

router.route('/register').post(controller.register).get(controller.showRegisterPage)
router.route('/login').post(controller.login).get(controller.showLoginPage)
router.route("/refresh").post(controller.refreshToken)

router.route("/forget-password").get(controller.showForgetPasswordView).post(controller.forgetPassword);

router.route("/reset-password/:token").get(controller.showResetPasswordView);
router.route("/reset-password").post(controller.resetPassword);

module.exports = router