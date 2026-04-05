import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';

function App() {
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarChats, setSidebarChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadSidebarChats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chat/all');
      setSidebarChats(res.data);
    } catch (err) {
      console.log('Could not load sidebar chats');
    }
  };

  useEffect(() => {
    loadSidebarChats();
  }, []);

  const handleSelectChat = async (chat) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${chat.chatId}`);
      const fullChat = res.data;
      setUploadedDoc({
        documentId: fullChat.documentId._id,
        originalName: fullChat.documentId.originalName,
        chunkCount: fullChat.documentId.chunkCount || '?'
      });
      setActiveChatId(chat.chatId);
    } catch (err) {
      console.log('Could not load chat');
    }
  };

  const handleUploadSuccess = (doc) => {
    setUploadedDoc(doc);
    setActiveChatId(null);
    loadSidebarChats();
  };

  const handleNewChat = () => {
    setUploadedDoc(null);
    setActiveChatId(null);
    loadSidebarChats();
  };

  const handleChatCreated = (chatId) => {
    setActiveChatId(chatId);
    loadSidebarChats();
  };

  return (
    <div className="app-layout">
      <Sidebar
        chats={sidebarChats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`app-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="app-header">
          <div className="header-left">
            {/* Toggle button always visible in header */}
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div className="logo-icon">Q</div>
            <span className="app-title">DocQA</span>
          </div>
          <div className="header-right">Powered by LLaMA 3 · Groq</div>
        </header>

        <main className="app-main">
          {!uploadedDoc ? (
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          ) : (
            <ChatInterface
              document={uploadedDoc}
              initialChatId={activeChatId}
              onReset={handleNewChat}
              onChatCreated={handleChatCreated}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;