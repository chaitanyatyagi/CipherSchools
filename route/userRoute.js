const User = require("../model/userModel")
const express = require("express")
const router = express.Router()
const { body, validationResult } = require('express-validator');
const userController = require("../controller/userController")

router.route("/update-me").patch(userController.uploadUserPhoto, userController.resizeUserPhoto, [
    body('email').trim().isEmail().withMessage('Email must be valid email.').normalizeEmail().toLowerCase(),
    body('name').trim().isLength(1).withMessage('Name field cannot be empty.'),
    body('mobile').trim().isLength(10).withMessage('Mobile number should have 10 digits.')
], userController.updateProfile)

router.route("/password-change").patch(
    [
        body('password').trim().isLength(8).withMessage('Password length short, minimum 8 characters'),
        body('newpassword').trim().isLength(8).withMessage('Password length short, minimum 8 characters'),
        body('changepassword').custom((value, { req }) => {
            if (req.body.changepassword != req.body.newpassword) {
                throw new Error("Password do not match")
            }
            return true
        }),
    ], userController.passwordChange)
router.route('/interests').patch(userController.Interest)
router.route('/get-user').post(userController.getUser)
router.route('/create-follower').post(userController.createFollowers)
router.route('/get-followers').get(userController.getFollowers)
router.route('/follow-user').patch(userController.followUser)

module.exports = router