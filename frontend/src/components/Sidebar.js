import React from 'react';

function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, isOpen, onToggle }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const groups = {};
  chats.forEach(chat => {
    const label = formatDate(chat.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(chat);
  });

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>

      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          <span>✏</span> New Chat
        </button>
      </div>

      <div className="sidebar-list">
        {chats.length === 0 ? (
          <div className="sidebar-empty">
            <p>No chat history yet.</p>
            <p>Upload a document to start!</p>
          </div>
        ) : (
          Object.entries(groups).map(([dateLabel, groupChats]) => (
            <div key={dateLabel} className="sidebar-group">
              <div className="sidebar-group-label">{dateLabel}</div>
              {groupChats.map(chat => (
                <button
                  key={chat.chatId}
                  className={`sidebar-item ${activeChatId === chat.chatId ? 'active' : ''}`}
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="sidebar-item-icon">📄</div>
                  <div className="sidebar-item-content">
                    <div className="sidebar-item-title">{chat.documentName}</div>
                    <div className="sidebar-item-preview">
                      {chat.lastMessage.length > 45
                        ? chat.lastMessage.slice(0, 45) + '…'
                        : chat.lastMessage}
                    </div>
                  </div>
                  {chat.messageCount > 0 && (
                    <div className="sidebar-item-count">{Math.floor(chat.messageCount / 2)}</div>
                  )}
                </button>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <span className="footer-dot" />
          MongoDB connected
        </div>
      </div>

    </div>
  );
}

export default Sidebar;