const express = require('express');
const controller = require('./auth.controller');

const router = express.Router()

router.route('/register').post(controller.register).get(controller.showRegisterPage)
router.route('/login').post(controller.login).get(controller.showLoginPage)

module.exports = router