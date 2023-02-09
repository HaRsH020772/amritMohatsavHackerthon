const express = require("express");
const router = express.Router();
const {needyRegistration, needyLogin, createExamPost, updateTheExamPost, deleteTheExamPost} = require('../controller/needyController');

router.route('/needy-register').post(needyRegistration);
router.route('/needy-login').post(needyLogin);
router.route('/exam-detail-post').post(createExamPost);
router.route('/exam-detail-update/:postId').put(updateTheExamPost);
router.route('/exam-detail-delete/:postId').delete(deleteTheExamPost);

module.exports = router;