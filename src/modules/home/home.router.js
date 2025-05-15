const express = require('express');
const router = express.Router()

const controller = require('./home.controller');

router.route('/').get(controller.showHomePage)

module.exports = router