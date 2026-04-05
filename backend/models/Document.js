const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  text: String,
  embedding: [Number],
  index: Number
});

const documentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  uploadedAt: { type: Date, default: Date.now },
  chunks: [chunkSchema]
});

module.exports = mongoose.model('Document', documentSchema);
