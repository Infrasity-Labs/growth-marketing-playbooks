// AI Chat Widget for Documentation
// Auto-loads on every Mintlify page

(function() {
  'use strict';
  
  // ============================================================================
  // USER CONFIGURATION - Edit these values to customize for your product
  // ============================================================================
  
  const USER_CONFIG = {
  PRODUCT_NAME: 'Documentation',                   // Your product name (change in .env PRODUCT_NAME)
  API_URL: 'http://localhost:5000/api/ask',        // Backend API endpoint
  SUGGESTIONS_URL: 'http://localhost:5000/api/suggestions',  
  LLM_MODEL: 'Llama 3.2',                          // Display name of your LLM
                          
    // Example questions shown in the welcome screen
    EXAMPLE_QUESTIONS: [
      'What can you help me with?',
      'How do I get started?',
      'Tell me about the key concepts'
    ],
    
    // Welcome message configuration
    WELCOME_TITLE: 'Hi! I\'m your AI assistant',
    WELCOME_MESSAGE: 'Ask me anything about the documentation'
  };
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
  } else {
    initChatWidget();
  }
  
  function initChatWidget() {
    // Prevent multiple initializations
    if (document.getElementById('docs-chat-widget')) {
      return;
    }
    
    console.log(` Initializing ${USER_CONFIG.PRODUCT_NAME} AI Chat Widget...`);
    
    // Theme Configuration (keep existing or customize)
    const THEME_CONFIG = {
      API_URL: USER_CONFIG.API_URL,
      SUGGESTIONS_URL: USER_CONFIG.SUGGESTIONS_URL,
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
    style.id = 'docs-chat-styles';
    style.textContent = `
      /* AI Chat Widget Styles */
      #docs-chat-button {
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
      
      #docs-chat-button:hover {
        background: #6d28d9;
        opacity: 0.9;
      }
      
      #docs-chat-button:active {
        transform: scale(0.98);
      }
      
      #docs-chat-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 450px;
        height: 100vh;
        background: ${THEME_CONFIG.DARK_BG};
        box-shadow: -4px 0 32px rgba(0, 0, 0, 0.5);
        z-index: 999999;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border-left: 1px solid ${THEME_CONFIG.BORDER_DARK};
      }
      
      #docs-chat-panel.open {
        transform: translateX(0);
      }
      
      .docs-chat-header {
        background: ${THEME_CONFIG.DARK_PANEL};
        color: white;
        padding: 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid ${THEME_CONFIG.BORDER_DARK};
      }
      
      .docs-header-content {
        flex: 1;
      }
      
      .docs-header-content h3 {
        margin: 0;
        font-size: 17px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        letter-spacing: -0.02em;
        color: #f8fafc;
      }
      
      .docs-header-icon {
        width: 24px;
        height: 24px;
        background: ${THEME_CONFIG.GRADIENT};
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }
      
      .docs-header-content p {
        margin: 4px 0 0 0;
        font-size: 12px;
        opacity: 0.6;
        color: ${THEME_CONFIG.TEXT_SECONDARY};
        font-weight: 400;
      }
      
      .docs-close-btn {
        background: transparent;
        border: none;
        color: ${THEME_CONFIG.TEXT_SECONDARY};
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
      
      .docs-close-btn:hover {
        background: rgba(148, 163, 184, 0.1);
        color: ${THEME_CONFIG.TEXT_PRIMARY};
      }
      
      .docs-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        background: ${THEME_CONFIG.DARK_BG};
      }
      
      .docs-welcome {
        padding: 48px 24px 32px;
      }
      
      .docs-welcome h4 {
        font-size: 18px;
        color: ${THEME_CONFIG.TEXT_PRIMARY};
        margin: 0 0 8px 0;
        font-weight: 600;
        letter-spacing: -0.02em;
      }
      
      .docs-welcome p {
        color: ${THEME_CONFIG.TEXT_SECONDARY};
        margin: 0 0 24px 0;
        line-height: 1.5;
        font-size: 14px;
      }
      
      .docs-example-questions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .docs-example-btn {
        background: ${THEME_CONFIG.DARK_CARD};
        border: 1px solid ${THEME_CONFIG.BORDER_DARK};
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        color: ${THEME_CONFIG.TEXT_PRIMARY};
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: left;
        font-weight: 500;
      }
      
      .docs-example-btn:hover {
        background: ${THEME_CONFIG.DARK_INPUT};
        border-color: ${THEME_CONFIG.THEME_COLOR};
        color: white;
      }
      
      .docs-message {
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
      
      .docs-message.user {
        flex-direction: row-reverse;
      }
      
      .docs-message-avatar {
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
      
      .docs-message.user .docs-message-avatar {
        background: ${THEME_CONFIG.GRADIENT};
        color: white;
      }
      
      .docs-message.ai .docs-message-avatar {
        background: ${THEME_CONFIG.DARK_CARD};
        color: ${THEME_CONFIG.THEME_COLOR};
        border: 1px solid ${THEME_CONFIG.BORDER_DARK};
      }
      
      .docs-message-bubble {
        max-width: 75%;
        padding: 10px 14px;
        border-radius: 10px;
        line-height: 1.5;
        word-wrap: break-word;
        font-size: 14px;
      }
      
      .docs-message.user .docs-message-bubble {
        background: ${THEME_CONFIG.GRADIENT};
        color: white;
        border-bottom-right-radius: 3px;
      }
      
      .docs-message.ai .docs-message-bubble {
        background: ${THEME_CONFIG.DARK_CARD};
        border: 1px solid ${THEME_CONFIG.BORDER_DARK};
        color: ${THEME_CONFIG.TEXT_PRIMARY};
        border-bottom-left-radius: 3px;
      }
      
      .docs-message-sources {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(71, 85, 105, 0.5);
        font-size: 11px;
      }
      
      .docs-sources-title {
        font-weight: 600;
        color: ${THEME_CONFIG.TEXT_SECONDARY};
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .docs-source-item {
        background: rgba(42, 49, 66, 0.5);
        padding: 8px 10px;
        border-radius: 6px;
        margin-bottom: 6px;
        border-left: 2px solid ${THEME_CONFIG.THEME_COLOR};
      }
      
      .docs-source-item strong {
        color: ${THEME_CONFIG.THEME_COLOR};
        display: block;
        font-size: 10px;
        margin-bottom: 3px;
        font-weight: 600;
      }
      
      .docs-source-item p {
        color: ${THEME_CONFIG.TEXT_SECONDARY};
        font-size: 10px;
        margin: 0;
        line-height: 1.4;
      }
      
      .docs-typing {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #666;
        font-size: 14px;
      }
      
      .docs-typing-dots {
        display: flex;
        gap: 4px;
      }
      
      .docs-typing-dots span {
        width: 8px;
        height: 8px;
        background: ${THEME_CONFIG.THEME_COLOR};
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
      }
      
      .docs-typing-dots span:nth-child(1) { animation-delay: -0.32s; }
      .docs-typing-dots span:nth-child(2) { animation-delay: -0.16s; }
      
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }
      
      .docs-chat-input-container {
        padding: 20px 24px;
        background: ${THEME_CONFIG.DARK_PANEL};
        border-top: 1px solid ${THEME_CONFIG.BORDER_DARK};
      }
      
      .docs-chat-input-wrapper {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      .docs-chat-input {
        flex: 1;
        padding: 11px 16px;
        border: 1px solid ${THEME_CONFIG.BORDER_DARK};
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition: all 0.15s;
        font-family: inherit;
        background: ${THEME_CONFIG.DARK_CARD};
        color: ${THEME_CONFIG.TEXT_PRIMARY};
      }
      
      .docs-chat-input:focus {
        border-color: ${THEME_CONFIG.THEME_COLOR};
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
      }
      
      .docs-chat-input::placeholder {
        color: ${THEME_CONFIG.TEXT_SECONDARY};
        opacity: 0.6;
      }
      
      .docs-send-btn {
        background: ${THEME_CONFIG.GRADIENT};
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
      
      .docs-send-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      }
      
      .docs-send-btn:active:not(:disabled) {
        transform: scale(0.95);
      }
      
      .docs-send-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      
      .docs-error-message {
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
      
      .docs-error-close {
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
      
      .docs-error-close:hover {
        opacity: 1;
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        #docs-chat-panel {
          width: 100%;
        }
        
        #docs-chat-button {
          bottom: 20px;
          right: 20px;
          padding: 14px 24px;
          font-size: 15px;
        }
      }
      
      /* Scrollbar styling for dark theme */
      .docs-chat-messages::-webkit-scrollbar {
        width: 8px;
      }
      
      .docs-chat-messages::-webkit-scrollbar-track {
        background: ${THEME_CONFIG.DARK_BG};
      }
      
      .docs-chat-messages::-webkit-scrollbar-thumb {
        background: ${THEME_CONFIG.BORDER_DARK};
        border-radius: 4px;
      }
      
      .docs-chat-messages::-webkit-scrollbar-thumb:hover {
        background: #64748b;
      }
              /* FOLLOW-UP SUGGESTIONS */
      .docs-suggestions {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid rgba(71, 85, 105, 0.3);
      }
      .docs-suggestions-title {
        font-size: 12px;
        color: ${THEME_CONFIG.TEXT_SECONDARY};
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .docs-suggestion-btn {
        background: ${THEME_CONFIG.DARK_CARD};
        border: 1px solid ${THEME_CONFIG.BORDER_DARK};
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        color: ${THEME_CONFIG.TEXT_PRIMARY};
        transition: all 0.2s;
        text-align: left;
        margin-bottom: 8px;
        width: 100%;
      }
      .docs-suggestion-btn:hover {
        background: ${THEME_CONFIG.GRADIENT};
        border-color: ${THEME_CONFIG.THEME_COLOR};
        color: white;
        transform: translateX(4px);
      }
              /* Follow-ups Loading Animation */
      .docs-followups-loading {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 0;
        font-size: 13px;
        color: ${THEME_CONFIG.TEXT_SECONDARY};
      }
      .docs-followups-dots {
        display: flex;
        gap: 3px;
      }
      .docs-followups-dots span {
        width: 6px;
        height: 6px;
        background: ${THEME_CONFIG.THEME_COLOR};
        border-radius: 50%;
        animation: followupsBounce 1.2s infinite ease-in-out;
      }
      .docs-followups-dots span:nth-child(1) { animation-delay: -0.4s; }
      .docs-followups-dots span:nth-child(2) { animation-delay: -0.2s; }
      @keyframes followupsBounce {
        0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }

    `;
    document.head.appendChild(style);
    
    // Create chat widget HTML
    const chatWidget = document.createElement('div');
    chatWidget.id = 'docs-chat-widget';
    chatWidget.innerHTML = `
      <button id="docs-chat-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Ask AI</span>
      </button>
      
      <div id="docs-chat-panel">
        <div class="docs-chat-header">
          <div class="docs-header-content">
            <h3>
              <div class="docs-header-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              ${USER_CONFIG.PRODUCT_NAME} Docs AI
            </h3>
            <p>Powered by ${USER_CONFIG.LLM_MODEL}</p>
          </div>
          <button class="docs-close-btn" id="docs-close-chat">×</button>
        </div>
        
        <div class="docs-chat-messages" id="docs-messages">
          <div class="docs-welcome">
            <h4>${USER_CONFIG.WELCOME_TITLE}</h4>
            <p>${USER_CONFIG.WELCOME_MESSAGE}</p>
            <div class="docs-example-questions">
              ${USER_CONFIG.EXAMPLE_QUESTIONS.map(q => 
                `<button class="docs-example-btn" data-question="${q}">${q}</button>`
              ).join('')}
            </div>
          </div>
        </div>
        
        <div class="docs-chat-input-container">
          <div class="docs-chat-input-wrapper">
            <input 
              type="text" 
              class="docs-chat-input" 
              id="docs-input" 
              placeholder="Ask anything about the docs..."
              autocomplete="off"
            />
            <button class="docs-send-btn" id="docs-send">➤</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(chatWidget);
    
    // State
    let isOpen = false;
    let isLoading = false;
    
    // Elements
    const chatButton = document.getElementById('docs-chat-button');
    const chatPanel = document.getElementById('docs-chat-panel');
    const closeBtn = document.getElementById('docs-close-chat');
    const messagesContainer = document.getElementById('docs-messages');
    const input = document.getElementById('docs-input');
    const sendBtn = document.getElementById('docs-send');
    
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
    document.querySelectorAll('.docs-example-btn').forEach(btn => {
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
  const welcome = document.querySelector('.docs-welcome');
  if (welcome) welcome.remove();
  
  // Add user message
  addMessage('user', question);
  input.value = '';
  
  // Show loading
  isLoading = true;
  sendBtn.disabled = true;
  const loadingId = addLoadingMessage();
  
  try {
    const response = await fetch(THEME_CONFIG.API_URL, {
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
    
    // Add AI response WITH FOLLOW-UP SUGGESTIONS 🔥
    addMessage('ai', data.answer, data.sources);
    //  Show "Generating follow-ups..." animation
const followupsId = addFollowupsLoading();

await loadSuggestions(question); 

// Remove loading when done
removeMessage(followupsId);
     
     
    
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
      messageDiv.className = `docs-message ${role}`;
      
      let sourcesHtml = '';
      if (sources && sources.length > 0) {
        sourcesHtml = `
          <div class="docs-message-sources">
            <div class="docs-sources-title">Sources</div>
            ${sources.map(s => `
              <div class="docs-source-item">
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
        <div class="docs-message-avatar">${avatarContent}</div>
        <div class="docs-message-bubble">
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
      loadingDiv.className = 'docs-message ai';
      loadingDiv.innerHTML = `
        <div class="docs-message-avatar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="docs-message-bubble">
          <div class="docs-typing">
            <div class="docs-typing-dots">
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
      errorDiv.className = 'docs-error-message';
      errorDiv.innerHTML = `
        <span><strong>Error:</strong> ${escapeHtml(message)}</span>
        <button class="docs-error-close">×</button>
      `;
      messagesContainer.appendChild(errorDiv);
      errorDiv.querySelector('.docs-error-close').addEventListener('click', () => errorDiv.remove());
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

// NEW: Follow-ups loading animation
function addFollowupsLoading() {
  const loadingDiv = document.createElement('div');
  const loadingId = 'followups-' + Date.now();
  loadingDiv.id = loadingId;
  loadingDiv.className = 'docs-followups-loading';
  loadingDiv.innerHTML = `
    <div class="docs-followups-dots">
      <span></span><span></span><span></span>
    </div>
    <span>Generating follow-ups...</span>
  `;
  
  // Insert after LAST AI message bubble
  const lastAiBubble = messagesContainer.querySelector('.docs-message.ai:last-of-type .docs-message-bubble');
  if (lastAiBubble) {
    lastAiBubble.appendChild(loadingDiv);
    scrollToBottom();
  }
  
  return loadingId;
}

    
    // NEW: Load dynamic follow-up suggestions
async function loadSuggestions(lastQuestion) {
  try {
    const response = await fetch(THEME_CONFIG.SUGGESTIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: lastQuestion })
    });
    
    if (response.ok) {
      const data = await response.json();
      showSuggestions(data.suggestions);
    }
  } catch (error) {
    console.log('Suggestions unavailable:', error);
  }
}

//  NEW: Show suggestions UI
function showSuggestions(suggestions) {
  // Remove existing suggestions
  const existing = document.querySelector('.docs-suggestions');
  if (existing) existing.remove();
  
  if (!suggestions || suggestions.length === 0) return;
  
  const suggestionsDiv = document.createElement('div');
  suggestionsDiv.className = 'docs-suggestions';
  suggestionsDiv.innerHTML = `
    <div class="docs-suggestions-title">
      ✨ Follow-up suggestions:
    </div>
    ${suggestions.slice(0, 3).map(suggestion => 
      `<button class="docs-suggestion-btn" data-question="${escapeHtml(suggestion)}">${suggestion}</button>`
    ).join('')}
  `;
  
  // Add click handlers
  suggestionsDiv.querySelectorAll('.docs-suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.getAttribute('data-question');
      input.value = question;
      // Remove suggestions when clicking
      suggestionsDiv.remove();
      sendMessage();
    });
  });
  
  // Insert after LAST AI message
  const lastAiMessage = messagesContainer.querySelector('.docs-message.ai:last-of-type .docs-message-bubble');
  if (lastAiMessage) {
    lastAiMessage.appendChild(suggestionsDiv);
  }
  
  scrollToBottom();
}


    
    console.log('✅ AI Chat Widget loaded successfully!');
  }
})();

