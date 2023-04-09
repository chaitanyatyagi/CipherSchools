const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../model/userModel")
const { sendMail } = require("../utils/sendMaill")
const { Str } = require('@supercharge/strings')
const { body, validationResult } = require('express-validator');

router.post("/register", [
    body('email').trim().isEmail().withMessage('Email must be valid email.').normalizeEmail().toLowerCase(),
    body('password').trim().isLength(8).withMessage('Password length short, minimum 8 characters'),
    body('name').trim().isLength(1).withMessage('Name field cannot be empty.'),
    body('mobile').trim().isLength(10).withMessage('Mobile number should have 10 digits.')],
    async (req, res) => {
        try {
            const errors = validationResult(req).errors
            let msg = []
            if (errors.length != 0) {
                errors.map((err, key) => {
                    msg.push(err.msg)
                })
                return res.status(200).json({
                    status: "fault",
                    message: msg
                })
            }
            const { name, email, password, mobile } = req.body
            const user = await User.findOne({ email })

            if (user && user.length != 0) {
                return res.status(200).json({
                    status: "fault",
                    message: "You have already registered !"
                })
            }

            const newUser = await User.create({
                email, password, name, mobile
            })

            return res.status(200).json({
                status: "success",
                message: "Registered Successfully !",
                newUser
            })
        }
        catch (error) {
            console.log(error)
            return res.status(400).json({
                status: "error",
                message: error
            })
        }
    })

router.post("/login", [
    body('email').trim().isEmail().withMessage('Email must be valid email.').normalizeEmail().toLowerCase(),
    body('password').trim().isLength(8).withMessage('Password length short, minimum 8 characters'),
],
    async (req, res) => {
        try {
            const errors = validationResult(req).errors
            let msg = []
            if (errors.length != 0) {
                errors.map((err, key) => {
                    msg.push(err.msg)
                })
                return res.status(200).json({
                    status: "fault",
                    message: msg
                })
            }

            const { email, password } = req.body
            const user = await User.findOne({
                email
            })

            if (!user || user.length == 0) {
                return res.status(200).json({
                    status: "fault",
                    message: "No user found. Please register first !"
                })
            }

            const passwordDb = user.password
            if (password != passwordDb) {
                return res.status(200).json({
                    status: "fault",
                    message: "Entered Password in wrong !"
                })
            }
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "90d",
            });

            return res.status(200).json({
                status: "success",
                message: "Logged In Successfully !",
                token,
                user
            })
        }
        catch (error) {
            console.log(error)
            return res.status(400).json({
                status: "error",
                message: error
            })
        }
    })


router.post("/forget-password", [
    body('email').trim().isEmail().withMessage('Email must be valid email.').normalizeEmail().toLowerCase(),
],
    async (req, res, next) => {
        try {
            const errors = validationResult(req).errors
            let msg = []
            if (errors.length != 0) {
                errors.map((err, key) => {
                    msg.push(err.msg)
                })
                return res.status(200).json({
                    status: "fault",
                    message: msg
                })
            }
            const email = req.body.email
            const user = await User.find({ email })
            if (user.length == 0) {
                return res.status(200).json({
                    status: "fault",
                    message: "No user found. Please enter correct email id !"
                })
            }
            const token = Str.random(60)
            await User.updateOne({ email }, { resetTokenForPassword: token, resetTokenTime: Date.now() + 10 * 60 * 1000 })
            await sendMail(email, `<p>Please reset your password at this link - <a href="http://127.0.0.1:3000/reset-password?token=${token}">Click</a></p>`, "Reset Your Password",)

            return res.status(200).json(
                {
                    status: "success",
                    message: 'Reset Password link has been sent, to the registered email.'
                }
            )

        }
        catch (error) {
            console.log(error)
            return res.status(400).json({
                status: "error",
                message: error
            })
        }
    })
router.post("/reset-password/:token", [
    body('password').trim().isLength(8).withMessage('Password length short, minimum 8 characters'),
],
    async (req, res, next) => {
        const errors = validationResult(req).errors
        let msg = []
        if (errors.length != 0) {
            errors.map((err, key) => {
                msg.push(err.msg)
            })
            return res.status(200).json({
                status: "fault",
                message: msg
            })
        }
        try {
            const password = req.body.password
            const token = req.params.token
            const user = await User.findOne({ resetTokenForPassword: token, resetTokenTime: { $gt: Date.now() } })

            if (!user || user.length == 0) {
                return res.status(200).json({
                    status: "fault",
                    message: "Your link has expired !"
                })
            }

            await User.updateOne({ resetTokenForPassword: token }, { $set: { resetTokenForPassword: null, resetTokenTime: null, password: password } })
            return res.status(200).json({
                status: "success",
                message: "Your password has been reset !"
            })
        }
        catch (error) {
            console.log(error)
            return res.status(400).json({
                status: "error",
                message: error
            })
        }
    })

module.exports = router