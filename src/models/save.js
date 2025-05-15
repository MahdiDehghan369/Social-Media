const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    post: {
        type: mongoose.Types.ObjectId,
        ref: "posts",
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true
    }
})


const model = mongoose.model("save" , schema)

module.exports = model