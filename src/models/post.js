const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  media: {
    path: { type: String, required: true },
    fileName: { type: String, required: true },
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  hashtags: {
    type: [String],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
});


const model = mongoose.model('posts' , schema)


module.exports = model