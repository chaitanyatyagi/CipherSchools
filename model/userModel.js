const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobile: String,
    interests: {
        type: Array,
        default: []
    },
    photo: {
        type: String,
        default: "default.jpeg"
    },
    resetTokenForPassword: {
        type: String,
        default: null
    },
    resetTokenTime: {
        type: Date,
        default: null
    },
    followers: {
        type: Array,
        default: []
    }
})

const User = mongoose.model('User', userSchema)
module.exports = User