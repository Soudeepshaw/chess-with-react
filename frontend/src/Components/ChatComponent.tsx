import React, { useState } from 'react';

interface ChatProps {
  sendMessage: (message: string) => void;
  messages: { sender: string; text: string }[];
  color: 'white' | 'black';
}

const ChatComponent: React.FC<ChatProps> = ({ sendMessage, messages, color }) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };
    return (
      <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#2C3E50', borderRadius: '15px', padding: '15px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div className="message-display" style={{ flex: 1, overflowY: 'auto', marginBottom: '15px', padding: '10px' }}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender === color ? 'own-message' : 'opponent-message'}`} style={{ 
              marginBottom: '15px', 
              padding: '12px', 
              borderRadius: '12px', 
              maxWidth: '75%', 
              alignSelf: msg.sender === color ? 'flex-end' : 'flex-start', 
              backgroundColor: msg.sender === color ? '#3498DB' : '#34495E', 
              color: '#FFFFFF',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              animation: 'fadeIn 0.3s ease-in-out'
            }}>
              <span className="sender" style={{ fontWeight: 'bold', marginBottom: '6px', display: 'block', color: '#ECF0F1' }}>{msg.sender}</span>
              <p className="message-text" style={{ margin: 0, lineHeight: '1.4' }}>{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="message-input" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#34495E', borderRadius: '25px', padding: '5px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="message-input-field"
            style={{ 
              flex: 1, 
              padding: '12px 20px', 
              borderRadius: '20px', 
              border: 'none', 
              outline: 'none', 
              backgroundColor: '#2C3E50', 
              color: '#FFFFFF',
              fontSize: '16px'
            }}
          />
          <button 
            onClick={handleSend} 
            className="send-button" 
            style={{ 
              marginLeft: '10px', 
              padding: '12px 24px', 
              borderRadius: '20px', 
              border: 'none', 
              backgroundColor: '#2ECC71', 
              color: 'white', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease'
            }}
          >
            Send
          </button>
        </div>
      </div>
    );};

export default ChatComponent;