// AI Chat Widget for Kubiya Documentation
// Auto-loads on every Mintlify page

(function() {
  'use strict';
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
  } else {
    initChatWidget();
  }
  
  function initChatWidget() {
    // Prevent multiple initializations
    if (document.getElementById('kubiya-chat-widget')) {
      return;
    }
    
    console.log('🤖 Initializing Kubiya AI Chat Widget...');
    
    // Configuration
    const CONFIG = {
      API_URL: 'http://localhost:5000/api/ask',
      THEME_COLOR: '#8b5cf6',
      THEME_HOVER: '#7c3aed',
      GRADIENT: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      DARK_BG: '#1a1f2e',
      DARK_PANEL: '#232938',
      DARK_CARD: '#2a3142',
      DARK_INPUT: '#2a3142',
      BORDER_DARK: '#374151',
      TEXT_PRIMARY: '#e2e8f0',
      TEXT_SECONDARY: '#94a3b8'
    };
    
    // Inject CSS
    const style = document.createElement('style');
    style.id = 'kubiya-chat-styles';
    style.textContent = `
      /* Kubiya AI Chat Widget Styles */
      #kubiya-chat-button {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #7c3aed;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        z-index: 999999;
        transition: all 0.15s ease;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        align-items: center;
        gap: 8px;
        letter-spacing: -0.01em;
      }
      
      #kubiya-chat-button:hover {
        background: #6d28d9;
        opacity: 0.9;
      }
      
      #kubiya-chat-button:active {
        transform: scale(0.98);
      }
      
      #kubiya-chat-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 450px;
        height: 100vh;
        background: ${CONFIG.DARK_BG};
        box-shadow: -4px 0 32px rgba(0, 0, 0, 0.5);
        z-index: 999999;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border-left: 1px solid ${CONFIG.BORDER_DARK};
      }
      
      #kubiya-chat-panel.open {
        transform: translateX(0);
      }
      
      .kubiya-chat-header {
        background: ${CONFIG.DARK_PANEL};
        color: white;
        padding: 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid ${CONFIG.BORDER_DARK};
      }
      
      .kubiya-header-content {
        flex: 1;
      }
      
      .kubiya-header-content h3 {
        margin: 0;
        font-size: 17px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        letter-spacing: -0.02em;
        color: #f8fafc;
      }
      
      .kubiya-header-icon {
        width: 24px;
        height: 24px;
        background: ${CONFIG.GRADIENT};
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }
      
      .kubiya-header-content p {
        margin: 4px 0 0 0;
        font-size: 12px;
        opacity: 0.6;
        color: ${CONFIG.TEXT_SECONDARY};
        font-weight: 400;
      }
      
      .kubiya-close-btn {
        background: transparent;
        border: none;
        color: ${CONFIG.TEXT_SECONDARY};
        font-size: 20px;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        flex-shrink: 0;
      }
      
      .kubiya-close-btn:hover {
        background: rgba(148, 163, 184, 0.1);
        color: ${CONFIG.TEXT_PRIMARY};
      }
      
      .kubiya-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        background: ${CONFIG.DARK_BG};
      }
      
      .kubiya-welcome {
        padding: 48px 24px 32px;
      }
      
      .kubiya-welcome h4 {
        font-size: 18px;
        color: ${CONFIG.TEXT_PRIMARY};
        margin: 0 0 8px 0;
        font-weight: 600;
        letter-spacing: -0.02em;
      }
      
      .kubiya-welcome p {
        color: ${CONFIG.TEXT_SECONDARY};
        margin: 0 0 24px 0;
        line-height: 1.5;
        font-size: 14px;
      }
      
      .kubiya-example-questions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .kubiya-example-btn {
        background: ${CONFIG.DARK_CARD};
        border: 1px solid ${CONFIG.BORDER_DARK};
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        color: ${CONFIG.TEXT_PRIMARY};
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: left;
        font-weight: 500;
      }
      
      .kubiya-example-btn:hover {
        background: ${CONFIG.DARK_INPUT};
        border-color: ${CONFIG.THEME_COLOR};
        color: white;
      }
      
      .kubiya-message {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        animation: fadeInUp 0.3s ease;
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .kubiya-message.user {
        flex-direction: row-reverse;
      }
      
      .kubiya-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
        font-weight: 600;
      }
      
      .kubiya-message.user .kubiya-message-avatar {
        background: ${CONFIG.GRADIENT};
        color: white;
      }
      
      .kubiya-message.ai .kubiya-message-avatar {
        background: ${CONFIG.DARK_CARD};
        color: ${CONFIG.THEME_COLOR};
        border: 1px solid ${CONFIG.BORDER_DARK};
      }
      
      .kubiya-message-bubble {
        max-width: 75%;
        padding: 10px 14px;
        border-radius: 10px;
        line-height: 1.5;
        word-wrap: break-word;
        font-size: 14px;
      }
      
      .kubiya-message.user .kubiya-message-bubble {
        background: ${CONFIG.GRADIENT};
        color: white;
        border-bottom-right-radius: 3px;
      }
      
      .kubiya-message.ai .kubiya-message-bubble {
        background: ${CONFIG.DARK_CARD};
        border: 1px solid ${CONFIG.BORDER_DARK};
        color: ${CONFIG.TEXT_PRIMARY};
        border-bottom-left-radius: 3px;
      }
      
      .kubiya-message-sources {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(71, 85, 105, 0.5);
        font-size: 11px;
      }
      
      .kubiya-sources-title {
        font-weight: 600;
        color: ${CONFIG.TEXT_SECONDARY};
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .kubiya-source-item {
        background: rgba(42, 49, 66, 0.5);
        padding: 8px 10px;
        border-radius: 6px;
        margin-bottom: 6px;
        border-left: 2px solid ${CONFIG.THEME_COLOR};
      }
      
      .kubiya-source-item strong {
        color: ${CONFIG.THEME_COLOR};
        display: block;
        font-size: 10px;
        margin-bottom: 3px;
        font-weight: 600;
      }
      
      .kubiya-source-item p {
        color: ${CONFIG.TEXT_SECONDARY};
        font-size: 10px;
        margin: 0;
        line-height: 1.4;
      }
      
      .kubiya-typing {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #666;
        font-size: 14px;
      }
      
      .kubiya-typing-dots {
        display: flex;
        gap: 4px;
      }
      
      .kubiya-typing-dots span {
        width: 8px;
        height: 8px;
        background: ${CONFIG.THEME_COLOR};
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
      }
      
      .kubiya-typing-dots span:nth-child(1) { animation-delay: -0.32s; }
      .kubiya-typing-dots span:nth-child(2) { animation-delay: -0.16s; }
      
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }
      
      .kubiya-chat-input-container {
        padding: 20px 24px;
        background: ${CONFIG.DARK_PANEL};
        border-top: 1px solid ${CONFIG.BORDER_DARK};
      }
      
      .kubiya-chat-input-wrapper {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      .kubiya-chat-input {
        flex: 1;
        padding: 11px 16px;
        border: 1px solid ${CONFIG.BORDER_DARK};
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition: all 0.15s;
        font-family: inherit;
        background: ${CONFIG.DARK_CARD};
        color: ${CONFIG.TEXT_PRIMARY};
      }
      
      .kubiya-chat-input:focus {
        border-color: ${CONFIG.THEME_COLOR};
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
      }
      
      .kubiya-chat-input::placeholder {
        color: ${CONFIG.TEXT_SECONDARY};
        opacity: 0.6;
      }
      
      .kubiya-send-btn {
        background: ${CONFIG.GRADIENT};
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
      }
      
      .kubiya-send-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      }
      
      .kubiya-send-btn:active:not(:disabled) {
        transform: scale(0.95);
      }
      
      .kubiya-send-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      
      .kubiya-error-message {
        background: rgba(239, 68, 68, 0.1);
        color: #fca5a5;
        padding: 12px 16px;
        border-radius: 10px;
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-left: 3px solid #ef4444;
      }
      
      .kubiya-error-close {
        background: none;
        border: none;
        color: #fca5a5;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        width: 24px;
        height: 24px;
        opacity: 0.8;
        transition: opacity 0.2s;
      }
      
      .kubiya-error-close:hover {
        opacity: 1;
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        #kubiya-chat-panel {
          width: 100%;
        }
        
        #kubiya-chat-button {
          bottom: 20px;
          right: 20px;
          padding: 14px 24px;
          font-size: 15px;
        }
      }
      
      /* Scrollbar styling for dark theme */
      .kubiya-chat-messages::-webkit-scrollbar {
        width: 8px;
      }
      
      .kubiya-chat-messages::-webkit-scrollbar-track {
        background: ${CONFIG.DARK_BG};
      }
      
      .kubiya-chat-messages::-webkit-scrollbar-thumb {
        background: ${CONFIG.BORDER_DARK};
        border-radius: 4px;
      }
      
      .kubiya-chat-messages::-webkit-scrollbar-thumb:hover {
        background: #64748b;
      }
    `;
    document.head.appendChild(style);
    
    // Create chat widget HTML
    const chatWidget = document.createElement('div');
    chatWidget.id = 'kubiya-chat-widget';
    chatWidget.innerHTML = `
      <button id="kubiya-chat-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Ask AI</span>
      </button>
      
      <div id="kubiya-chat-panel">
        <div class="kubiya-chat-header">
          <div class="kubiya-header-content">
            <h3>
              <div class="kubiya-header-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              Kubiya Docs AI
            </h3>
            <p>Powered by Llama 3.2</p>
          </div>
          <button class="kubiya-close-btn" id="kubiya-close-chat">×</button>
        </div>
        
        <div class="kubiya-chat-messages" id="kubiya-messages">
          <div class="kubiya-welcome">
            <h4>Hi! I'm your AI assistant</h4>
            <p>Ask me anything about Kubiya documentation</p>
            <div class="kubiya-example-questions">
              <button class="kubiya-example-btn" data-question="What is Kubiya?">
                What is Kubiya?
              </button>
              <button class="kubiya-example-btn" data-question="How do I get started?">
                How do I get started?
              </button>
              <button class="kubiya-example-btn" data-question="Tell me about agents">
                Tell me about agents
              </button>
            </div>
          </div>
        </div>
        
        <div class="kubiya-chat-input-container">
          <div class="kubiya-chat-input-wrapper">
            <input 
              type="text" 
              class="kubiya-chat-input" 
              id="kubiya-input" 
              placeholder="Ask anything about the docs..."
              autocomplete="off"
            />
            <button class="kubiya-send-btn" id="kubiya-send">➤</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(chatWidget);
    
    // State
    let isOpen = false;
    let isLoading = false;
    
    // Elements
    const chatButton = document.getElementById('kubiya-chat-button');
    const chatPanel = document.getElementById('kubiya-chat-panel');
    const closeBtn = document.getElementById('kubiya-close-chat');
    const messagesContainer = document.getElementById('kubiya-messages');
    const input = document.getElementById('kubiya-input');
    const sendBtn = document.getElementById('kubiya-send');
    
    // Event listeners
    chatButton.addEventListener('click', openChat);
    closeBtn.addEventListener('click', closeChat);
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !isLoading) {
        sendMessage();
      }
    });
    
    // Example question buttons
    document.querySelectorAll('.kubiya-example-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.getAttribute('data-question');
        input.value = question;
        sendMessage();
      });
    });
    
    function openChat() {
      isOpen = true;
      chatPanel.classList.add('open');
      chatButton.style.display = 'none';
      setTimeout(() => input.focus(), 300);
    }
    
    function closeChat() {
      isOpen = false;
      chatPanel.classList.remove('open');
      chatButton.style.display = 'flex';
    }
    
    async function sendMessage() {
      const question = input.value.trim();
      if (!question || isLoading) return;
      
      // Clear welcome message
      const welcome = document.querySelector('.kubiya-welcome');
      if (welcome) welcome.remove();
      
      // Add user message
      addMessage('user', question);
      input.value = '';
      
      // Show loading
      isLoading = true;
      sendBtn.disabled = true;
      const loadingId = addLoadingMessage();
      
      try {
        const response = await fetch(CONFIG.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove loading
        removeMessage(loadingId);
        
        // Add AI response
        addMessage('ai', data.answer, data.sources);
        
      } catch (error) {
        console.error('Chat error:', error);
        removeMessage(loadingId);
        addErrorMessage('Could not connect to AI backend. Make sure it\'s running on port 5000.');
      } finally {
        isLoading = false;
        sendBtn.disabled = false;
      }
    }
    
    function addMessage(role, content, sources = null) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `kubiya-message ${role}`;
      
      let sourcesHtml = '';
      if (sources && sources.length > 0) {
        sourcesHtml = `
          <div class="kubiya-message-sources">
            <div class="kubiya-sources-title">Sources</div>
            ${sources.map(s => `
              <div class="kubiya-source-item">
                <strong>${escapeHtml(s.file)}</strong>
                <p>${escapeHtml(s.preview)}</p>
              </div>
            `).join('')}
          </div>
        `;
      }
      
      const avatarContent = role === 'user' 
        ? 'U' 
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
      
      messageDiv.innerHTML = `
        <div class="kubiya-message-avatar">${avatarContent}</div>
        <div class="kubiya-message-bubble">
          ${escapeHtml(content)}
          ${sourcesHtml}
        </div>
      `;
      
      messagesContainer.appendChild(messageDiv);
      scrollToBottom();
    }
    
    function addLoadingMessage() {
      const loadingDiv = document.createElement('div');
      const loadingId = 'loading-' + Date.now();
      loadingDiv.id = loadingId;
      loadingDiv.className = 'kubiya-message ai';
      loadingDiv.innerHTML = `
        <div class="kubiya-message-avatar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="kubiya-message-bubble">
          <div class="kubiya-typing">
            <div class="kubiya-typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Thinking...</span>
          </div>
        </div>
      `;
      messagesContainer.appendChild(loadingDiv);
      scrollToBottom();
      return loadingId;
    }
    
    function removeMessage(id) {
      const msg = document.getElementById(id);
      if (msg) msg.remove();
    }
    
    function addErrorMessage(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'kubiya-error-message';
      errorDiv.innerHTML = `
        <span><strong>Error:</strong> ${escapeHtml(message)}</span>
        <button class="kubiya-error-close">×</button>
      `;
      messagesContainer.appendChild(errorDiv);
      errorDiv.querySelector('.kubiya-error-close').addEventListener('click', () => errorDiv.remove());
      scrollToBottom();
    }
    
    function scrollToBottom() {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    console.log('✅ Kubiya AI Chat Widget loaded successfully!');
  }
})();
