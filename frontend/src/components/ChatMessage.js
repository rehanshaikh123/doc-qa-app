import React from 'react';

function ChatMessage({ role, content, timestamp }) {
  const isUser = role === 'user';

  const formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-avatar">
        {isUser ? 'U' : 'AI'}
      </div>
      <div className="message-body">
        <div
          className="message-bubble"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
        {timestamp && <span className="message-time">{timestamp}</span>}
      </div>
    </div>
  );
}

export default ChatMessage;
