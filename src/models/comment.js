const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  page: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true
  },
  post: {
    type: mongoose.Types.ObjectId,
    ref: "post",
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  content: {
    type: String,
    required: true
  },
  parent: {
    type: mongoose.Types.ObjectId,
    ref: "comment",
    required: false
  }
}, {
    timestamps: true
});


const model = mongoose.model("comment" , schema)

module.exports = model