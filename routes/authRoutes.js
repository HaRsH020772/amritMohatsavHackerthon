const express = require("express");
const router = express.Router();
const {userOtpSend, userOtpVerify} = require('../controller/authController');

router.route('/user-send-otp').post(userOtpSend);
router.route('/user-verify-otp').post(userOtpVerify);

module.exports = router;