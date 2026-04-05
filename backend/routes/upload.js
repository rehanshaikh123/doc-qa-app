const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { parseDocument } = require('../utils/parseDocument');
const { generateEmbedding } = require('../utils/embeddings');
const Document = require('../models/Document');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are allowed'));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/', (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'File too large. Maximum allowed size is 10 MB. Please upload a smaller file.'
        });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    console.log(`📄 Processing: ${req.file.originalname}`);

    const chunks = await parseDocument(req.file.path, req.file.mimetype);
    console.log(`✂️  Split into ${chunks.length} chunks`);

    const chunksWithEmbeddings = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🔢 Embedding chunk ${i + 1}/${chunks.length}...`);
      const embedding = await generateEmbedding(chunks[i]);
      chunksWithEmbeddings.push({ text: chunks[i], embedding, index: i });
    }

    const doc = await Document.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      chunks: chunksWithEmbeddings
    });

    fs.unlinkSync(req.file.path);
    console.log(`✅ Document saved: ${doc._id}`);

    res.json({
      success: true,
      documentId: doc._id,
      originalName: doc.originalName,
      chunkCount: chunks.length
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

module.exports = router;
