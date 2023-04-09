const multer = require('multer')
const sharp = require('sharp')
const User = require("../model/userModel")
const { body, validationResult } = require('express-validator');
const Follower = require("../model/followersModel")

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    }
    else {
        req.msg = "Only image is allowed"
        cb(null, false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = async (req, file, next) => {
    if (!req.file) return next()
    req.file.filename = `user-` + req.file.originalname
    await sharp(req.file.buffer).resize(550, 550).toFormat('jpg').jpeg({ quality: 90 }).toFile(`public/user/${req.file.filename}`)
    next()
}

exports.updateProfile = async (req, res, next) => {
    try {
        if (req.msg == "Only image is allowed") {
            return res.status(200).json({
                status: "fault",
                message: "Only image is allowed"
            })
        }
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
        var { id, name, email, mobile } = req.body
        var photo
        if (req.file) {
            photo = req.file.filename
        }
        else {
            return res.status(200).json({
                status: "fault",
                message: "Please select the file"
            })
        }

        const updatedUser = await User.findByIdAndUpdate({ _id: id }, {
            $set: { name },
            $set: { email },
            $set: { mobile },
            $set: { photo },
        })
        console.log(req.file, photo, updatedUser.photo)
        return res.status(200).json({
            status: "success",
            message: "Details has been updated !",
            updatedUser
        })
    }
    catch (error) {
        console.log(error)
        return res.status(400).json({
            status: "error",
            message: error.error
        })
    }
}

exports.passwordChange = async (req, res, next) => {
    try {
        const { _id, password, newpassword, changepassword } = req.body
        const user = await User.findById({ _id: _id })
        if (user.password != password) {
            return res.status(200).json({
                status: "fault",
                message: "Please enter correct current password."
            })
        }
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
        const updatedUser = await User.findByIdAndUpdate(_id, {
            $set: { password: newpassword }
        })
        return res.status(200).json({
            status: "success",
            message: "Details has been updated !",
            updatedUser
        })
    }
    catch (error) {
        console.log(error)
        return res.status(400).json({
            status: "error",
            message: error
        })
    }
}

exports.Interest = async (req, res, next) => {
    try {
        const { _id, interests } = req.body
        const updatedUser = await User.findByIdAndUpdate(_id, {
            $set: { interests }
        })
        return res.status(200).json({
            status: "success",
            message: "Details has been updated !",
            updatedUser
        })
    }
    catch (error) {
        console.log(error)
        return res.status(400).json({
            status: "error",
            message: error
        })
    }
}

exports.getUser = async (req, res) => {
    try {
        const { _id } = req.body
        const user = await User.find({ _id })
        return res.status(200).json({
            user
        })
    }
    catch (err) {
        console.log(err)
        return res.status(400).json({
            status: "error",
            message: err
        })
    }
}

exports.createFollowers = async (req, res) => {
    try {
        const { name, detail, follow } = req.body
        const follower = await Follower.create({
            name,
            detail,
            follow
        })
        return res.status(200).json({
            follower
        })
    }
    catch (error) {
        return res.status(400).json({
            status: "error",
            message: error
        })
    }
}

exports.getFollowers = async (req, res) => {
    try {
        const followers = await Follower.find()
        return res.status(200).json({
            followers
        })
    }
    catch (error) {
        return res.status(400).json({
            status: "error",
            message: error
        })
    }
}

exports.followUser = async (req, res) => {
    try {
        const { follower, user, chkr } = req.body
        const name = await Follower.findOne({ _id: follower })

        if (chkr) {
            await Follower.findByIdAndUpdate({ _id: follower }, { $addToSet: { user } }, { upsert: true })
            await User.findByIdAndUpdate({ _id: user }, { $addToSet: { followers: follower } }, { upsert: true })

            return res.status(200).json({
                status: "success",
                message: `You are now following - ${name.name}`
            })
        }
        else {
            await Follower.findByIdAndUpdate({ _id: follower }, { $pull: { user } }, { upsert: true })
            await User.findByIdAndUpdate({ _id: user }, { $pull: { followers: follower } }, { upsert: true })

            return res.status(200).json({
                status: "success",
                message: `You have unfollowed - ${name.name}`
            })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(400).json({
            status: "error",
            message: err
        })
    }
}