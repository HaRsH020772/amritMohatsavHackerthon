const express = require("express");
const router = express.Router();
const {writerRegistration, writerLogin, getTheNeedyList} = require('../controller/writerController');

router.route('/writer-register').post(writerRegistration);
router.route('/writer-login').post(writerLogin);
router.route('/writer-needy-list').post(getTheNeedyList);

module.exports = router;