import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ChatMessage from './ChatMessage';

function ChatInterface({ document, initialChatId, onReset, onChatCreated }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [chatId, setChatId] = useState(initialChatId || null);
  const bottomRef = useRef();
  const textareaRef = useRef();

  // Load messages on mount or when initialChatId changes
  useEffect(() => {
    const loadMessages = async () => {
      setLoadingHistory(true);
      setChatId(initialChatId || null);

      if (initialChatId) {
        try {
          const res = await axios.get(`http://localhost:5000/api/chat/${initialChatId}`);
          const fetched = res.data.messages || [];
          const restored = fetched.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(restored);
        } catch (err) {
          console.log('Could not load chat messages');
          setMessages([{
            role: 'assistant',
            content: `I've loaded **"${document.originalName}"**. Ask me anything!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      } else {
        setMessages([{
          role: 'assistant',
          content: `I've loaded **"${document.originalName}"** (${document.chunkCount} chunks indexed). Ask me anything about this document!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
      setLoadingHistory(false);
    };

    loadMessages();
  }, [initialChatId, document.documentId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setError('');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', content: question, timestamp }]);
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        documentId: document.documentId,
        question,
        chatId
      });

      const newChatId = res.data.chatId;
      if (!chatId) {
        setChatId(newChatId);
        onChatCreated && onChatCreated(newChatId);
      }

      const answerTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer, timestamp: answerTime }]);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loadingHistory) {
    return (
      <div className="chat-wrapper">
        <div className="chat-loading-screen">
          <div className="chat-loading-dots"><span /><span /><span /></div>
          <p>Loading chat history…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-wrapper">

      {/* Top bar */}
      <div className="chat-topbar">
        <div className="chat-topbar-left">
          <span className="doc-icon">📄</span>
          <span className="doc-badge">{document.originalName}</span>
          <span className="chunk-badge">{document.chunkCount} chunks</span>
        </div>
        <div className="chat-topbar-right">
          <button className="reset-btn" onClick={onReset}>+ New Document</button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-avatar">AI</div>
            <div className="message-body">
              <div className="loading-wrapper">
                <div className="typing-indicator"><span /><span /><span /></div>
                <span className="loading-text">Thinking…</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <div className="error-content">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button className="error-close" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        <div className="input-box">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Message DocQA…"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || loading}>
            {loading ? <span className="send-spinner" /> : '↑'}
          </button>
        </div>
        <p className="input-hint">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

export default ChatInterface;
