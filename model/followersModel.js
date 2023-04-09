const mongoose = require("mongoose")

const followSchema = new mongoose.Schema({
    name: String,
    detail: String,
    follow: String,
    user: {
        type: Array,
        default: []
    }
})

const Follower = mongoose.model('Follow', followSchema)
module.exports = Follower