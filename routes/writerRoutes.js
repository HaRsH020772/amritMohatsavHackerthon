const express = require("express");
const router = express.Router();
const {writerRegistration, writerLogin, getTheNeedyList, acceptTheNeedyRequest} = require('../controller/writerController');

router.route('/writer-register').post(writerRegistration);
router.route('/writer-login').post(writerLogin);
router.route('/writer-needy-list').post(getTheNeedyList);
router.route('/writer-exampost-accept').post(acceptTheNeedyRequest);

module.exports = router;