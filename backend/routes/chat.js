const express = require('express');
const { generateEmbedding, getTopChunks } = require('../utils/embeddings');
const { generateAnswer } = require('../utils/ragPipeline');
const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');

const router = express.Router();

// POST - send a message
router.post('/', async (req, res) => {
  try {
    const { documentId, question, chatId } = req.body;
    if (!documentId || !question) {
      return res.status(400).json({ error: 'documentId and question are required' });
    }

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    let chat;
    if (chatId) chat = await ChatHistory.findById(chatId);
    if (!chat) chat = await ChatHistory.create({ documentId, messages: [] });

    const queryEmbedding = await generateEmbedding(question);
    const topChunks = getTopChunks(queryEmbedding, doc.chunks);
    const context = topChunks.join('\n\n---\n\n');
    const history = chat.messages.map(m => ({ role: m.role, content: m.content }));
    const answer = await generateAnswer(context, question, history);

    chat.messages.push({ role: 'user', content: question });
    chat.messages.push({ role: 'assistant', content: answer });
    await chat.save();

    res.json({ success: true, chatId: chat._id, answer, sourcesUsed: topChunks.length });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Chat failed' });
  }
});

// GET - all chats (for sidebar) with document name
router.get('/all', async (req, res) => {
  try {
    const chats = await ChatHistory.find({})
      .populate('documentId', 'originalName')
      .select('_id documentId createdAt messages')
      .sort({ createdAt: -1 });

    const result = chats.map(c => ({
      chatId: c._id,
      documentName: c.documentId ? c.documentId.originalName : 'Unknown Document',
      documentId: c.documentId ? c.documentId._id : null,
      createdAt: c.createdAt,
      messageCount: c.messages.length,
      lastMessage: c.messages.filter(m => m.role === 'user').slice(-1)[0]?.content || 'No messages yet'
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - fetch one chat by id
router.get('/:chatId', async (req, res) => {
  try {
    const chat = await ChatHistory.findById(req.params.chatId).populate('documentId', 'originalName chunkCount');
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
