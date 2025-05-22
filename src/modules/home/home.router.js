const express = require('express');
const router = express.Router()

const controller = require('./home.controller');
const authMiddleware = require('../../middlewares/auth');

router.route('/').get(authMiddleware , controller.showHomePage)

module.exports = router