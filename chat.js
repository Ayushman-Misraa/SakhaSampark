// Chat Interface JavaScript

// DOM Elements
const userDisplayName = document.getElementById('userDisplayName');
const logoutBtn = document.getElementById('logoutBtn');
const peerIdInput = document.getElementById('peerIdInput');
const sendRequestBtn = document.getElementById('sendRequestBtn');
const requestsList = document.getElementById('requestsList');
const contactsList = document.getElementById('contactsList');
const currentChatName = document.getElementById('currentChatName');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

// PeerJS Variables
let myPeer = null;
let currentUserId = null;
let connections = {}; // Store active connections
let pendingRequests = {}; // Store pending connection requests

// Chat Variables
let activeContact = null; // Currently selected contact
let conversations = {}; // Store messages for each contact
let messageIdCounter = 0; // Counter for generating unique message IDs

// Theme toggle functionality
const lightThemeBtn = document.getElementById('lightThemeBtn');
const darkThemeBtn = document.getElementById('darkThemeBtn');
const neonThemeBtn = document.getElementById('neonThemeBtn');

// Set theme based on localStorage or default to light theme
function setTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme === 'dark' ? 'dark-theme' : 
                             savedTheme === 'neon' ? 'neon-theme' : '';
}

// Initialize theme
setTheme();

// Theme button event listeners
lightThemeBtn.addEventListener('click', () => {
    document.body.className = '';
    localStorage.setItem('theme', 'light');
});

darkThemeBtn.addEventListener('click', () => {
    document.body.className = 'dark-theme';
    localStorage.setItem('theme', 'dark');
});

neonThemeBtn.addEventListener('click', () => {
    document.body.className = 'neon-theme';
    localStorage.setItem('theme', 'neon');
});

// Check if user is logged in and initialize PeerJS
document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            const displayName = user.displayName || user.email.split('@')[0];
            userDisplayName.textContent = displayName;
            currentUserId = displayName;
            
            // Initialize PeerJS with the user's ID
            initializePeerJS(displayName);
            
            // Load user data, contacts, and chat history from Firebase
            loadUserData(user.uid);
        } else {
            // User is not signed in, redirect to login page
            window.location.href = 'index.html';
        }
    });
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut()
        .then(() => {
            // Sign-out successful, redirect to login page
            window.location.href = 'index.html';
        })
        .catch((error) => {
            // An error happened during sign out
            console.error('Logout Error:', error);
        });
});

// Send contact request using PeerJS
sendRequestBtn.addEventListener('click', () => {
    const peerId = peerIdInput.value.trim();
    if (peerId) {
        // Send connection request to the peer
        sendConnectionRequest(peerId);
        
        // Clear the input field
        peerIdInput.value = '';
    } else {
        alert('Please enter a valid username (Peer ID)');
    }
});

// Handle contact selection and load chat
document.addEventListener('click', (e) => {
    const contactItem = e.target.closest('.contact-item');
    if (contactItem) {
        // Remove active class from all contacts
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected contact
        contactItem.classList.add('active');
        
        // Remove unread status if present
        contactItem.classList.remove('unread');
        
        // Get contact ID from data attribute
        const contactId = contactItem.dataset.peerId;
        
        // Set as active contact
        activeContact = contactId;
        
        // Update current chat name
        currentChatName.textContent = contactId;
        
        // Hide welcome screen
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }
        
        // Update contact status in header
        updateChatHeader(contactId);
        
        // Clear chat messages
        chatMessages.innerHTML = '';
        
        // Initialize conversation object if it doesn't exist
        if (!conversations[contactId]) {
            conversations[contactId] = {
                messages: [],
                lastRead: new Date().toISOString(),
                typing: false
            };
        }
        
        // Add a date separator for today
        addDateSeparator(new Date());
        
        // Load and display conversation
        displayConversation(contactId);
        
        // Mark messages as read
        markMessagesAsRead(contactId);
        
        // Check if we have an active connection to this contact
        if (!connections[contactId]) {
            // Try to establish a connection if not already connected
            if (myPeer && myPeer.id) {
                sendConnectionRequest(contactId);
            }
        } else {
            // Send read receipts for messages
            sendReadReceipts(contactId);
        }
        
        // Focus the message input
        messageInput.focus();
    }
});

/**
 * Update the chat header with contact information
 * @param {string} contactId - The ID of the contact
 */
function updateChatHeader(contactId) {
    // Get the contact avatar and status elements
    const contactAvatar = document.querySelector('.chat-contact-info .contact-avatar');
    const contactName = document.querySelector('.chat-contact-info .contact-name');
    const contactStatus = document.querySelector('.chat-contact-info .contact-status');
    
    if (contactAvatar && contactName && contactStatus) {
        // Update the contact name
        contactName.textContent = contactId;
        
        // Check if the contact is online
        const isOnline = connections[contactId] && connections[contactId].open;
        
        // Update the status text
        contactStatus.textContent = isOnline ? 'Online' : 'Offline';
        
        // Update the avatar status indicator
        const statusIndicator = contactAvatar.querySelector('.online-status');
        if (isOnline) {
            if (!statusIndicator) {
                const indicator = document.createElement('span');
                indicator.className = 'online-status';
                contactAvatar.appendChild(indicator);
            }
        } else {
            if (statusIndicator) {
                statusIndicator.remove();
            }
        }
    }
}

/**
 * Add a date separator to the chat
 * @param {Date} date - The date to display
 */
function addDateSeparator(date) {
    // Format the date
    const dateString = date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Check if we already have this date separator
    const existingSeparators = Array.from(chatMessages.querySelectorAll('.message-date'));
    const hasDate = existingSeparators.some(el => el.textContent === dateString);
    
    if (!hasDate) {
        // Create the date separator
        const dateDiv = document.createElement('div');
        dateDiv.className = 'message-date';
        dateDiv.textContent = dateString;
        
        // Add to chat
        chatMessages.appendChild(dateDiv);
    }
}

/**
 * Display the conversation with a contact
 * @param {string} contactId - The ID of the contact
 */
function displayConversation(contactId) {
    // Load chat history from Firebase first
    loadChatHistory(contactId)
        .then(() => {
            // Then display any in-memory messages that might not be in Firebase yet
            if (conversations[contactId] && conversations[contactId].messages.length > 0) {
                // Get the last message timestamp from the DOM
                const lastMessageElement = chatMessages.querySelector('.message:last-child');
                let lastTimestamp = null;
                
                if (lastMessageElement) {
                    const timeElement = lastMessageElement.querySelector('.message-time');
                    if (timeElement) {
                        // Extract timestamp from data attribute if it exists
                        lastTimestamp = lastMessageElement.dataset.timestamp;
                    }
                }
                
                // Display only messages that are newer than the last one shown
                conversations[contactId].messages.forEach(message => {
                    if (!lastTimestamp || message.timestamp > lastTimestamp) {
                        displayMessage(message, contactId);
                    }
                });
            }
            
            // Scroll to bottom
            scrollToBottom();
            
            // Show typing indicator if the contact is typing
            if (conversations[contactId] && conversations[contactId].typing) {
                showTypingIndicator(contactId, true);
            }
        });
}

/**
 * Load chat history for a specific contact from Firebase
 * @param {string} contactId - The ID of the contact
 * @returns {Promise} - A promise that resolves when the history is loaded
 */
function loadChatHistory(contactId) {
    return new Promise((resolve, reject) => {
        const userId = firebase.auth().currentUser?.uid;
        if (!userId) {
            console.warn('Cannot load chat history: No user is logged in');
            loadLocalChatHistory(contactId).then(resolve).catch(reject);
            return;
        }
        
        // Create a unique chat ID (combination of both user IDs, alphabetically sorted)
        const chatId = [userId, contactId].sort().join('_');
        
        // Try to load messages from Firebase
        firebase.database().ref(`chats/${chatId}/messages`).orderByChild('timestamp')
            .limitToLast(50) // Limit to last 50 messages
            .once('value')
            .then(snapshot => {
                const messages = snapshot.val() || {};
                
                // Process and display messages
                processAndDisplayMessages(messages, contactId);
                
                // Resolve the promise
                resolve();
            })
            .catch(error => {
                console.error('Error loading chat history from Firebase:', error);
                
                // If there's a permission error, try to load from local storage
                if (error.message && error.message.includes('permission_denied')) {
                    console.log('Falling back to local storage for chat history');
                    loadLocalChatHistory(contactId).then(resolve).catch(reject);
                } else {
                    reject(error);
                }
            });
    });
}

/**
 * Load chat history from local storage
 * @param {string} contactId - The ID of the contact
 * @returns {Promise} - A promise that resolves when the history is loaded
 */
function loadLocalChatHistory(contactId) {
    return new Promise((resolve) => {
        try {
            const userId = firebase.auth().currentUser?.uid || 'local_user';
            const chatId = [userId, contactId].sort().join('_');
            const localStorageKey = `chat_${chatId}_messages`;
            
            // Try to get messages from local storage
            const storedMessages = localStorage.getItem(localStorageKey);
            let messages = {};
            
            if (storedMessages) {
                try {
                    messages = JSON.parse(storedMessages);
                    console.log(`Loaded ${Object.keys(messages).length} messages from local storage`);
                } catch (e) {
                    console.error('Error parsing local messages:', e);
                }
            }
            
            // Process and display messages
            processAndDisplayMessages(messages, contactId);
            
            // Resolve the promise
            resolve();
        } catch (e) {
            console.error('Error loading chat history from local storage:', e);
            resolve(); // Resolve anyway to continue the flow
        }
    });
}

/**
 * Process and display messages
 * @param {Object} messages - The messages object
 * @param {string} contactId - The ID of the contact
 */
function processAndDisplayMessages(messages, contactId) {
    // Group messages by date
    const messagesByDate = {};
    
    // Process messages
    Object.keys(messages).forEach(key => {
        const message = messages[key];
        
        // Add message ID
        message.id = key;
        
        // Convert timestamp to Date object
        const messageDate = new Date(message.timestamp);
        
        // Get date string for grouping
        const dateString = messageDate.toLocaleDateString();
        
        // Initialize array for this date if it doesn't exist
        if (!messagesByDate[dateString]) {
            messagesByDate[dateString] = [];
        }
        
        // Add message to the appropriate date group
        messagesByDate[dateString].push(message);
        
        // Store in memory conversation
        if (!conversations[contactId]) {
            conversations[contactId] = { messages: [], lastRead: null, typing: false };
        }
        
        // Check if we already have this message in memory
        const existingIndex = conversations[contactId].messages.findIndex(m => m.id === key);
        if (existingIndex === -1) {
            conversations[contactId].messages.push(message);
        } else {
            // Update existing message
            conversations[contactId].messages[existingIndex] = message;
        }
    });
    
    // Sort dates chronologically
    const sortedDates = Object.keys(messagesByDate).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    // Clear chat messages if we have messages to display
    if (sortedDates.length > 0) {
        chatMessages.innerHTML = '';
    }
    
    // Display messages grouped by date
    sortedDates.forEach(dateString => {
        // Add date separator
        addDateSeparator(new Date(dateString));
        
        // Sort messages by timestamp
        const sortedMessages = messagesByDate[dateString].sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
        
        // Display messages
        sortedMessages.forEach(message => {
            displayMessage(message, contactId);
        });
    });
}

/**
 * Display a message in the chat
 * @param {Object} message - The message object
 * @param {string} contactId - The ID of the contact
 */
function displayMessage(message, contactId) {
    // Determine if this is a sent or received message
    const isSent = message.sender === currentUserId;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
    messageElement.dataset.id = message.id;
    messageElement.dataset.timestamp = message.timestamp;
    
    // Format timestamp
    const messageDate = new Date(message.timestamp);
    const timeString = messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Determine message status icon
    let statusIcon = '';
    if (isSent) {
        if (message.read) {
            statusIcon = '<i class="fas fa-check-double message-status read"></i>';
        } else if (message.delivered) {
            statusIcon = '<i class="fas fa-check-double message-status delivered"></i>';
        } else {
            statusIcon = '<i class="fas fa-check message-status sent"></i>';
        }
    }
    
    // Decode the message content if it's encoded
    let decodedContent;
    
    if (message.isEncoded) {
        try {
            // Try to decode the content
            decodedContent = decodeURIComponent(message.content);
        } catch (error) {
            console.error('Error decoding message content:', error);
            // Fallback to raw content or original content
            decodedContent = message.rawContent || message.content;
        }
    } else {
        // If not encoded, use the content as is
        decodedContent = message.content;
    }
    
    // Create message content element
    const messageContent = document.createElement('p');
    messageContent.textContent = decodedContent; // Using textContent preserves emoji characters
    
    // Build message HTML structure
    const messageContentDiv = document.createElement('div');
    messageContentDiv.className = 'message-content';
    messageContentDiv.appendChild(messageContent);
    
    const messageTimeDiv = document.createElement('div');
    messageTimeDiv.className = 'message-time';
    messageTimeDiv.innerHTML = `${timeString} ${statusIcon}`;
    
    // Add elements to message
    messageElement.appendChild(messageContentDiv);
    messageElement.appendChild(messageTimeDiv);
    
    // Add to chat
    chatMessages.appendChild(messageElement);
}

/**
 * Mark messages from a contact as read
 * @param {string} contactId - The ID of the contact
 */
function markMessagesAsRead(contactId) {
    // Update the last read timestamp
    if (conversations[contactId]) {
        conversations[contactId].lastRead = new Date().toISOString();
    }
    
    // Remove unread indicator from contact list
    const contactItem = contactsList.querySelector(`.contact-item[data-peer-id="${contactId}"]`);
    if (contactItem) {
        contactItem.classList.remove('unread');
    }
}

/**
 * Send read receipts for messages
 * @param {string} contactId - The ID of the contact
 */
function sendReadReceipts(contactId) {
    const conn = connections[contactId];
    if (!conn || !conn.open) return;
    
    // Get unread messages from this contact
    if (conversations[contactId] && conversations[contactId].messages) {
        const unreadMessages = conversations[contactId].messages.filter(msg => 
            msg.sender === contactId && !msg.readReceipt
        );
        
        // Send read receipts
        unreadMessages.forEach(message => {
            conn.send({
                type: 'read_receipt',
                messageId: message.id,
                timestamp: new Date().toISOString()
            });
            
            // Mark as read receipt sent
            message.readReceipt = true;
        });
    }
}

/**
 * Scroll the chat to the bottom
 */
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message and handle typing indicator
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    } else {
        // Send typing indicator
        sendTypingIndicator(true);
    }
});

// Add a debounced typing indicator when the user stops typing
let typingTimeout;
messageInput.addEventListener('input', () => {
    // Clear previous timeout
    clearTimeout(typingTimeout);
    
    // Send typing indicator
    sendTypingIndicator(true);
    
    // Set a timeout to stop the typing indicator after 2 seconds of inactivity
    typingTimeout = setTimeout(() => {
        sendTypingIndicator(false);
    }, 2000);
});

// Send typing indicator to the current chat contact
function sendTypingIndicator(isTyping) {
    const recipientId = currentChatName.textContent;
    
    if (recipientId !== 'Select a contact') {
        // Get the connection to the recipient
        const conn = connections[recipientId];
        
        if (conn) {
            // Send typing indicator
            conn.send({
                type: 'typing',
                isTyping: isTyping,
                timestamp: new Date().toISOString()
            });
        }
    }
}

function sendMessage() {
    const messageText = messageInput.value.trim();
    const recipientId = activeContact;
    
    if (messageText && recipientId) {
        // Get the connection to the recipient
        const conn = connections[recipientId];
        
        if (!conn || !conn.open) {
            showNotification(`No active connection to ${recipientId}. Message saved as draft.`, 'error');
            
            // Store as draft message
            if (!conversations[recipientId]) {
                conversations[recipientId] = { messages: [], lastRead: null, typing: false };
            }
            
            // Encode the message content to preserve emoji characters
            const encodedContent = encodeURIComponent(messageText);
            
            const draftMessage = {
                id: `draft_${Date.now()}`,
                content: encodedContent,
                rawContent: messageText,
                timestamp: new Date().toISOString(),
                sender: currentUserId,
                status: 'draft',
                isEncoded: true
            };
            
            conversations[recipientId].messages.push(draftMessage);
            
            // Display the draft message
            displayMessage(draftMessage, recipientId);
            
            // Clear input
            messageInput.value = '';
            
            // Scroll to bottom
            scrollToBottom();
            
            return;
        }
        
        // Generate a unique message ID
        const messageId = `msg_${Date.now()}_${messageIdCounter++}`;
        
        // Create message data
        const now = new Date();
        const timestamp = now.toISOString();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Encode the message content to preserve emoji characters
        const encodedContent = encodeURIComponent(messageText);
        
        // Create message data object with encoded content
        const messageData = {
            type: 'message',
            id: messageId,
            content: encodedContent, // Send encoded content
            rawContent: messageText, // Also send raw content for fallback
            timestamp: timestamp,
            sender: currentUserId,
            status: 'sent',
            isEncoded: true // Flag to indicate content is encoded
        };
        
        // Send the message through the connection
        conn.send(messageData);
        
        // Store the message in Firebase
        storeMessage(recipientId, messageData);
        
        // Store in memory conversation
        if (!conversations[recipientId]) {
            conversations[recipientId] = { messages: [], lastRead: null, typing: false };
        }
        
        conversations[recipientId].messages.push(messageData);
        
        // Display the message
        displayMessage(messageData, recipientId);
        
        // Update last message in contact list
        updateLastMessage(recipientId, messageText, timeString);
        
        // Clear input
        messageInput.value = '';
        
        // Stop typing indicator
        sendTypingIndicator(false);
        
        // Scroll to bottom
        scrollToBottom();
    }
}

/**
 * Process a received message
 * @param {string} senderId - The ID of the sender
 * @param {Object} messageData - The message data object
 */
function processReceivedMessage(senderId, messageData) {
    // Ensure the message has an ID
    if (!messageData.id) {
        messageData.id = `msg_${Date.now()}_${messageIdCounter++}`;
    }
    
    // Store in memory conversation
    if (!conversations[senderId]) {
        conversations[senderId] = { messages: [], lastRead: null, typing: false };
    }
    
    // Check if we already have this message
    const existingIndex = conversations[senderId].messages.findIndex(m => m.id === messageData.id);
    if (existingIndex === -1) {
        // Add to conversation
        conversations[senderId].messages.push(messageData);
        
        // Store the message in Firebase
        storeMessage(senderId, messageData);
        
        // If we're currently chatting with this sender, display the message
        if (activeContact === senderId) {
            // Check if we need to add a date separator
            const messageDate = new Date(messageData.timestamp);
            addDateSeparator(messageDate);
            
            // Display the message
            displayMessage(messageData, senderId);
            
            // Mark as read
            markMessagesAsRead(senderId);
            
            // Send read receipt
            sendReadReceipt(senderId, messageData.id);
            
            // Scroll to bottom
            scrollToBottom();
        } else {
            // Otherwise, mark the contact as having unread messages
            const contactItem = contactsList.querySelector(`.contact-item[data-peer-id="${senderId}"]`);
            if (contactItem) {
                contactItem.classList.add('unread');
            }
        }
        
        // Decode message content for display in contact list if needed
        let displayContent = messageData.content;
        
        if (messageData.isEncoded) {
            try {
                displayContent = decodeURIComponent(messageData.content);
            } catch (e) {
                console.error('Error decoding message in processReceivedMessage:', e);
                // Fallback to raw content or original content
                displayContent = messageData.rawContent || messageData.content;
            }
        }
        
        // Update last message in contact list
        updateLastMessage(senderId, displayContent);
        
        // Play notification sound for new messages
        playMessageSound();
    }
}

/**
 * Send a read receipt for a message
 * @param {string} recipientId - The ID of the message sender
 * @param {string} messageId - The ID of the message
 */
function sendReadReceipt(recipientId, messageId) {
    const conn = connections[recipientId];
    if (!conn || !conn.open) return;
    
    conn.send({
        type: 'read_receipt',
        messageId: messageId,
        timestamp: new Date().toISOString()
    });
}

/**
 * Play a notification sound for new messages
 */
function playMessageSound() {
    // Create an audio element
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3');
    audio.volume = 0.3;
    audio.play().catch(error => {
        console.error('Error playing message sound:', error);
    });
}

/**
 * Store a message in Firebase
 * @param {string} recipientId - The ID of the message recipient
 * @param {Object} messageData - The message data object
 * @returns {string} The message ID
 */
function storeMessage(recipientId, messageData) {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) {
        console.warn('Cannot store message: No user is logged in');
        return messageData.id || `local_${Date.now()}_${messageIdCounter++}`;
    }
    
    // Create a unique chat ID (combination of both user IDs, alphabetically sorted)
    const chatId = [userId, recipientId].sort().join('_');
    
    // Prepare message data for storage
    const storageData = {
        content: messageData.content,
        sender: messageData.sender,
        timestamp: messageData.timestamp,
        status: messageData.status || 'sent',
        read: messageData.read || false,
        delivered: messageData.delivered || false
    };
    
    // Use the message ID if provided, otherwise generate a new one
    const messageId = messageData.id || `msg_${Date.now()}_${messageIdCounter++}`;
    
    // Store message in local storage as a fallback
    try {
        // Get existing messages for this chat
        const localStorageKey = `chat_${chatId}_messages`;
        let localMessages = {};
        
        try {
            const storedMessages = localStorage.getItem(localStorageKey);
            if (storedMessages) {
                localMessages = JSON.parse(storedMessages);
            }
        } catch (e) {
            console.warn('Error parsing local messages:', e);
        }
        
        // Add the new message
        localMessages[messageId] = storageData;
        
        // Store back in local storage (limit to last 100 messages)
        const messageIds = Object.keys(localMessages);
        if (messageIds.length > 100) {
            // Sort by timestamp and keep only the latest 100
            const sortedIds = messageIds.sort((a, b) => {
                return new Date(localMessages[b].timestamp) - new Date(localMessages[a].timestamp);
            });
            
            // Create a new object with only the latest 100 messages
            const trimmedMessages = {};
            sortedIds.slice(0, 100).forEach(id => {
                trimmedMessages[id] = localMessages[id];
            });
            
            localMessages = trimmedMessages;
        }
        
        localStorage.setItem(localStorageKey, JSON.stringify(localMessages));
        console.log('Message stored in local storage');
        
        // Also update last message
        localStorage.setItem(`chat_${chatId}_lastMessage`, JSON.stringify({
            content: messageData.content,
            sender: messageData.sender,
            timestamp: messageData.timestamp,
            read: messageData.read || false
        }));
    } catch (e) {
        console.warn('Could not store message in local storage:', e);
    }
    
    // Try to store the message in Firebase
    try {
        firebase.database().ref(`chats/${chatId}/messages/${messageId}`).set(storageData)
            .then(() => {
                console.log('Message stored successfully in Firebase');
                
                // Update the last message for this chat
                return firebase.database().ref(`chats/${chatId}/lastMessage`).set({
                    content: messageData.content,
                    sender: messageData.sender,
                    timestamp: messageData.timestamp,
                    read: messageData.read || false
                });
            })
            .then(() => {
                // Update the chat metadata
                return firebase.database().ref(`chats/${chatId}/metadata`).update({
                    lastUpdated: firebase.database.ServerValue.TIMESTAMP,
                    participants: [userId, recipientId]
                });
            })
            .catch(error => {
                console.error('Error storing message in Firebase:', error);
                
                // Show notification only for the first permission error
                if (error.message && error.message.includes('permission_denied')) {
                    const key = 'firebase_permission_warning_shown';
                    if (!sessionStorage.getItem(key)) {
                        showNotification('Unable to store messages in Firebase. Messages will be stored locally.', 'warning');
                        sessionStorage.setItem(key, 'true');
                    }
                }
            });
    } catch (e) {
        console.error('Exception while trying to store message:', e);
    }
    
    // Return the message ID
    return messageId;
}

/**
 * Update the last message shown in the contacts list
 * @param {string} contactId - The ID of the contact
 * @param {string} message - The message content
 * @param {string} [time] - The formatted time string (optional)
 */
function updateLastMessage(contactId, message, time = null) {
    const contactItem = contactsList.querySelector(`.contact-item[data-peer-id="${contactId}"]`);
    if (!contactItem) return;
    
    const lastMessageElement = contactItem.querySelector('.contact-last-message');
    const timeElement = contactItem.querySelector('.contact-time');
    
    if (lastMessageElement) {
        // Check if the message is encoded
        let displayMessage = message;
        
        // Try to decode if it looks like an encoded URI
        if (typeof message === 'string' && message.indexOf('%') !== -1) {
            try {
                displayMessage = decodeURIComponent(message);
            } catch (e) {
                console.error('Error decoding message in updateLastMessage:', e);
                // Keep original if decoding fails
            }
        }
        
        // Truncate message if it's too long
        const truncatedMessage = displayMessage.length > 30 ? displayMessage.substring(0, 27) + '...' : displayMessage;
        lastMessageElement.textContent = truncatedMessage;
    }
    
    if (timeElement) {
        // If time is not provided, use current time
        if (!time) {
            const now = new Date();
            time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        timeElement.textContent = time;
    }
    
    // Move the contact to the top of the list
    if (contactItem.parentNode) {
        contactItem.parentNode.prepend(contactItem);
    }
}

// Update dashboard link in the navigation
document.addEventListener('DOMContentLoaded', () => {
    // Add a link to dashboard if needed
    // This is just a placeholder for navigation between pages
});

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add icon based on type
    const icon = document.createElement('i');
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    notification.prepend(icon);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    notification.appendChild(closeBtn);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 500);
        }
    }, 5000);
}

// Handle window events for online/offline status and cleanup
window.addEventListener('online', () => {
    console.log('Browser is online');
    // Reconnect to PeerJS server if needed
    if (myPeer && currentUserId) {
        if (myPeer.disconnected) {
            myPeer.reconnect();
        }
        // Update user status in Firebase
        updateUserStatus(true);
    }
});

window.addEventListener('offline', () => {
    console.log('Browser is offline');
    // Update user status in Firebase
    updateUserStatus(false);
});

// Handle page unload to clean up connections and update status
window.addEventListener('beforeunload', () => {
    // Update user status in Firebase
    updateUserStatus(false);
    
    // Close all connections
    Object.values(connections).forEach(conn => {
        if (conn && conn.open) {
            conn.close();
        }
    });
    
    // Destroy peer connection
    if (myPeer) {
        myPeer.destroy();
    }
});

// PeerJS Functions

/**
 * Initialize PeerJS with the user's ID
 * @param {string} userId - The user's ID to use for PeerJS
 * @param {boolean} useRandomId - Whether to use a random ID instead of the user's ID
 */
function initializePeerJS(userId, useRandomId = false) {
    // Destroy existing peer if it exists
    if (myPeer) {
        myPeer.destroy();
    }
    
    let peerId;
    
    if (useRandomId) {
        // Generate a completely random ID with a prefix
        peerId = 'user_' + Math.random().toString(36).substr(2, 9);
    } else {
        // Use the provided userId, but sanitize it for PeerJS
        // Remove spaces, special characters, and ensure it's valid
        peerId = userId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    }
    
    console.log('Initializing PeerJS with ID:', peerId);
    
    // Create a new Peer object with options
    myPeer = new Peer(peerId, {
        debug: 2, // Set debug level (0-3)
        config: {
            'iceServers': [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });
    
    // Handle successful connection to PeerJS server
    myPeer.on('open', (id) => {
        console.log('Connected to PeerJS server with ID:', id);
        
        // Update the display name if using a random ID
        if (id !== userId) {
            // Store the mapping between display name and PeerJS ID
            storeUserPeerId(id);
            
            // Show a notification to the user
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = `Connected with ID: ${id}`;
            document.body.appendChild(notification);
            
            // Remove the notification after 5 seconds
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
        
        // Update user status in Firebase
        updateUserStatus(true);
        
        // Store the current peer ID
        currentUserId = id;
    });
    
    // Handle incoming connection requests
    myPeer.on('connection', handleIncomingConnection);
    
    // Handle errors
    myPeer.on('error', (err) => {
        console.error('PeerJS error:', err);
        
        // Handle ID already taken error
        if (err.type === 'unavailable-id' || (err.message && err.message.includes('is taken'))) {
            console.log('ID already taken, trying with random ID');
            
            // Destroy the current peer before creating a new one
            if (myPeer) {
                myPeer.destroy();
            }
            
            // Show notification to user
            showNotification('Your requested ID was already taken. Using a random ID instead.', 'warning');
            
            // Try again with a random ID after a short delay
            setTimeout(() => {
                initializePeerJS(userId, true);
            }, 500);
        } else if (err.type === 'peer-unavailable') {
            // The peer we're trying to connect to doesn't exist
            let peerId = 'unknown';
            if (err.message) {
                const parts = err.message.split(' ');
                if (parts.length > 1) {
                    peerId = parts[1];
                }
            }
            showNotification(`User ${peerId} is not online or doesn't exist.`, 'error');
        } else if (err.type === 'network' || err.type === 'server-error') {
            // Network or server error, try to reconnect after a delay
            showNotification('Network or server error. Attempting to reconnect...', 'warning');
            
            setTimeout(() => {
                console.log('Attempting to reconnect to PeerJS server...');
                try {
                    if (myPeer && myPeer.disconnected) {
                        myPeer.reconnect();
                    } else if (!myPeer || myPeer.destroyed) {
                        initializePeerJS(userId, useRandomId);
                    }
                } catch (e) {
                    console.error('Error during reconnection:', e);
                    // If reconnection fails, try to initialize a new peer
                    if (myPeer) {
                        myPeer.destroy();
                    }
                    setTimeout(() => {
                        initializePeerJS(userId, useRandomId);
                    }, 1000);
                }
            }, 5000);
        } else {
            // Generic error handler for other types of errors
            showNotification(`PeerJS error: ${err.type || 'Unknown error'}`, 'error');
        }
    });
    
    // Handle disconnection from PeerJS server
    myPeer.on('disconnected', () => {
        console.log('Disconnected from PeerJS server');
        // Update user status in Firebase
        updateUserStatus(false);
        
        // Try to reconnect after a delay
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            try {
                if (myPeer && !myPeer.destroyed && myPeer.disconnected) {
                    myPeer.reconnect();
                } else if (!myPeer || myPeer.destroyed) {
                    initializePeerJS(userId, useRandomId);
                }
            } catch (e) {
                console.error('Error during reconnection:', e);
                // If reconnection fails, try to initialize a new peer
                if (myPeer) {
                    try {
                        myPeer.destroy();
                    } catch (destroyError) {
                        console.error('Error destroying peer:', destroyError);
                    }
                }
                setTimeout(() => {
                    initializePeerJS(userId, useRandomId);
                }, 1000);
            }
        }, 5000);
    });
    
    // Handle close event
    myPeer.on('close', () => {
        console.log('PeerJS connection closed');
        // Update user status in Firebase
        updateUserStatus(false);
    });
}

/**
 * Store the mapping between display name and PeerJS ID in Firebase
 * @param {string} peerId - The PeerJS ID
 */
function storeUserPeerId(peerId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.warn('Cannot store user peer ID: No user is logged in');
        return;
    }
    
    // Store the mapping in local storage as a fallback
    try {
        const userIdMapping = {
            displayName: user.displayName || user.email.split('@')[0],
            peerId: peerId,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('userPeerId', JSON.stringify(userIdMapping));
        console.log('User ID mapping stored in local storage');
    } catch (e) {
        console.warn('Could not store user ID mapping in local storage:', e);
    }
    
    // Try to store the mapping in Firebase
    try {
        // Store the mapping in Firebase
        firebase.database().ref(`userIds/${user.uid}`).set({
            displayName: user.displayName || user.email.split('@')[0],
            peerId: peerId,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            console.log('User ID mapping stored in Firebase');
        }).catch(error => {
            console.error('Error storing user ID mapping in Firebase:', error);
            
            // Show notification only if it's a permission error
            if (error.message && error.message.includes('permission_denied')) {
                showNotification('Unable to store user ID mapping in Firebase. Using local storage instead.', 'warning');
            }
        });
        
        // Also store a reverse lookup
        firebase.database().ref(`peerIds/${peerId}`).set({
            uid: user.uid,
            displayName: user.displayName || user.email.split('@')[0],
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            console.log('Peer ID mapping stored in Firebase');
        }).catch(error => {
            console.error('Error storing peer ID mapping in Firebase:', error);
        });
    } catch (e) {
        console.error('Exception while trying to store user ID mapping:', e);
    }
}

/**
 * Handle incoming connection from another peer
 * @param {DataConnection} conn - The PeerJS data connection
 */
function handleIncomingConnection(conn) {
    console.log('Incoming connection from:', conn.peer);
    
    // Look up the display name for this peer ID
    lookupDisplayNameByPeerId(conn.peer)
        .then(displayName => {
            const contactId = displayName || conn.peer;
            
            // Store the connection request
            pendingRequests[contactId] = conn;
            
            // Add the request to the UI
            addConnectionRequest(contactId, conn.peer);
            
            // Set up connection event handlers
            setupConnectionHandlers(conn, contactId);
            
            // Play a notification sound
            playNotificationSound();
        })
        .catch(error => {
            console.error('Error looking up display name:', error);
            
            // Fall back to using the peer ID
            pendingRequests[conn.peer] = conn;
            addConnectionRequest(conn.peer);
            setupConnectionHandlers(conn);
        });
}

/**
 * Look up a display name by peer ID
 * @param {string} peerId - The peer ID to look up
 * @returns {Promise<string|null>} - The display name or null if not found
 */
function lookupDisplayNameByPeerId(peerId) {
    return new Promise((resolve, reject) => {
        // Look up the peer ID in Firebase
        firebase.database().ref(`peerIds/${peerId}`)
            .once('value')
            .then(snapshot => {
                const data = snapshot.val();
                
                if (data && data.displayName) {
                    console.log(`Found display name ${data.displayName} for peer ID ${peerId}`);
                    resolve(data.displayName);
                } else {
                    console.log(`No display name found for peer ID ${peerId}`);
                    resolve(null);
                }
            })
            .catch(error => {
                console.error('Error looking up display name:', error);
                reject(error);
            });
    });
}

/**
 * Play a notification sound for incoming requests
 */
function playNotificationSound() {
    // Create an audio element
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
        console.error('Error playing notification sound:', error);
    });
}

/**
 * Send a connection request to another peer
 * @param {string} peerIdOrName - The ID or display name of the peer to connect to
 */
function sendConnectionRequest(peerIdOrName) {
    if (peerIdOrName === currentUserId) {
        alert('You cannot connect to yourself');
        return;
    }
    
    // Check if connection already exists
    if (connections[peerIdOrName]) {
        alert(`You are already connected to ${peerIdOrName}`);
        return;
    }
    
    // First, try to look up the peer ID from the display name
    lookupPeerIdByName(peerIdOrName)
        .then(actualPeerId => {
            // If we found a peer ID, use it; otherwise use the original input
            const targetPeerId = actualPeerId || peerIdOrName;
            
            console.log(`Connecting to peer: ${targetPeerId}`);
            
            // Connect to the peer
            const conn = myPeer.connect(targetPeerId, {
                reliable: true
            });
            
            // Handle successful connection
            conn.on('open', () => {
                console.log('Connected to:', targetPeerId);
                
                // Store the connection using the display name for UI consistency
                const displayName = actualPeerId ? peerIdOrName : targetPeerId;
                connections[displayName] = conn;
                
                // Add the contact to the UI
                addContactToList(displayName);
                
                // Store the contact in Firebase
                storeContact(displayName, targetPeerId);
                
                // Set up connection event handlers
                setupConnectionHandlers(conn, displayName);
                
                // Show success message
                alert(`Successfully connected to ${displayName}`);
            });
            
            // Handle connection error
            conn.on('error', (err) => {
                console.error('Connection error:', err);
                alert(`Failed to connect to ${peerIdOrName}: ${err.message}`);
            });
        })
        .catch(error => {
            console.error('Error looking up peer ID:', error);
            alert(`Error connecting to ${peerIdOrName}: ${error.message}`);
        });
}

/**
 * Look up a peer ID by display name
 * @param {string} displayName - The display name to look up
 * @returns {Promise<string|null>} - The peer ID or null if not found
 */
function lookupPeerIdByName(displayName) {
    return new Promise((resolve, reject) => {
        // First, try a direct connection (in case the display name is actually a peer ID)
        // This will be caught by the error handler if it fails
        
        // Search Firebase for the display name
        firebase.database().ref('peerIds').orderByChild('displayName')
            .equalTo(displayName)
            .once('value')
            .then(snapshot => {
                const data = snapshot.val();
                
                if (data) {
                    // Found a match, get the first peer ID
                    const peerId = Object.keys(data)[0];
                    console.log(`Found peer ID ${peerId} for display name ${displayName}`);
                    resolve(peerId);
                } else {
                    // No match found, try using the input directly as a peer ID
                    console.log(`No peer ID found for ${displayName}, using as direct ID`);
                    resolve(null);
                }
            })
            .catch(error => {
                console.error('Error looking up peer ID:', error);
                // If lookup fails, try direct connection
                resolve(null);
            });
    });
}

/**
 * Set up event handlers for a connection
 * @param {DataConnection} conn - The PeerJS data connection
 * @param {string} [displayName] - The display name to use for the contact (defaults to conn.peer)
 */
function setupConnectionHandlers(conn, displayName = null) {
    // Use the provided display name or fall back to the peer ID
    const contactId = displayName || conn.peer;
    
    // Handle data received from peer
    conn.on('data', (data) => {
        console.log('Received data from', contactId, ':', data);
        
        // Ensure data is properly handled
        let processedData = data;
        
        // Handle different types of data
        switch (processedData.type) {
            case 'message':
                // Process the received message
                processReceivedMessage(contactId, data);
                break;
                
            case 'connection_accepted':
                console.log('Connection accepted by', contactId);
                // Update the UI to show the contact is online
                updateContactStatus(contactId, true);
                
                // If we have any draft messages, try to send them now
                sendDraftMessages(contactId);
                break;
                
            case 'typing':
                // Update typing status in conversation object
                if (conversations[contactId]) {
                    conversations[contactId].typing = data.isTyping;
                }
                
                // Show typing indicator if we're currently chatting with this peer
                if (activeContact === contactId) {
                    showTypingIndicator(contactId, data.isTyping);
                }
                break;
                
            case 'read_receipt':
                // Update message status to read
                updateMessageStatus(contactId, data.messageId, 'read');
                break;
                
            case 'profile_info':
                // Update contact's profile information
                updateContactProfile(contactId, data.profile);
                break;
                
            case 'connection_rejected':
                // Handle connection rejection
                showNotification(`${contactId} rejected your connection request`, 'error');
                
                // Remove the connection
                delete connections[contactId];
                break;
                
            case 'file':
                // Process the received file metadata
                processReceivedFile(contactId, data);
                break;
                
            case 'file-data':
                // Process the received file data
                processReceivedFile(contactId, data);
                break;
                
            default:
                console.log('Unknown data type received:', data.type);
        }
    });
    
    // Handle connection open
    conn.on('open', () => {
        console.log('Connection opened with:', contactId);
        // Update the UI to show the contact is online
        updateContactStatus(contactId, true);
        
        // Send our profile information
        sendProfileInfo(conn);
    });
    
    // Handle connection close
    conn.on('close', () => {
        console.log('Connection closed with:', contactId);
        // Remove the connection
        delete connections[contactId];
        // Update the UI to show the contact is offline
        updateContactStatus(contactId, false);
    });
    
    // Handle connection error
    conn.on('error', (err) => {
        console.error('Connection error with', contactId, ':', err);
        // Remove the connection
        delete connections[contactId];
        // Update the UI to show the contact is offline
        updateContactStatus(contactId, false);
    });
}

/**
 * Send profile information to a peer
 * @param {DataConnection} conn - The PeerJS data connection
 */
function sendProfileInfo(conn) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    // Create profile data
    const profileData = {
        type: 'profile_info',
        profile: {
            displayName: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL || null,
            timestamp: new Date().toISOString()
        }
    };
    
    // Send profile data
    conn.send(profileData);
}

/**
 * Update a contact's profile information
 * @param {string} contactId - The ID of the contact
 * @param {Object} profile - The profile data
 */
function updateContactProfile(contactId, profile) {
    // Update the contact in the UI
    const contactItem = contactsList.querySelector(`.contact-item[data-peer-id="${contactId}"]`);
    if (!contactItem) return;
    
    // Update the contact name if it's different
    if (profile.displayName && profile.displayName !== contactId) {
        const nameElement = contactItem.querySelector('.contact-name');
        if (nameElement) {
            nameElement.textContent = profile.displayName;
        }
    }
    
    // Store the updated profile in Firebase
    const userId = firebase.auth().currentUser?.uid;
    if (userId) {
        firebase.database().ref(`users/${userId}/contacts/${contactId}/profile`).update({
            displayName: profile.displayName,
            email: profile.email,
            photoURL: profile.photoURL,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        }).catch(error => {
            console.error('Error updating contact profile:', error);
        });
    }
}

/**
 * Show or hide typing indicator
 * @param {string} peerId - The ID of the peer who is typing
 * @param {boolean} isTyping - Whether the peer is typing
 */
function showTypingIndicator(peerId, isTyping) {
    // Remove existing typing indicator
    const existingIndicator = chatMessages.querySelector('.typing-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // If peer is typing, add typing indicator
    if (isTyping) {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="typing-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="typing-bubble">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <div class="typing-text">${peerId} is typing...</div>
            </div>
        `;
        
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Also update the contact status in the list
        const contactItem = contactsList.querySelector(`.contact-item[data-peer-id="${peerId}"]`);
        if (contactItem) {
            const lastMessageElement = contactItem.querySelector('.contact-last-message');
            if (lastMessageElement) {
                lastMessageElement.innerHTML = '<em>typing...</em>';
            }
        }
    } else {
        // Reset the contact status in the list
        const contactItem = contactsList.querySelector(`.contact-item[data-peer-id="${peerId}"]`);
        if (contactItem && conversations[peerId]) {
            // Find the last message
            const messages = conversations[peerId].messages;
            if (messages && messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                updateLastMessage(peerId, lastMessage.content);
            }
        }
    }
}

/**
 * Send any draft messages to a contact
 * @param {string} contactId - The ID of the contact
 */
function sendDraftMessages(contactId) {
    const conn = connections[contactId];
    if (!conn || !conn.open) return;
    
    // Check if we have any draft messages
    if (conversations[contactId] && conversations[contactId].messages) {
        const draftMessages = conversations[contactId].messages.filter(msg => 
            msg.sender === currentUserId && msg.status === 'draft'
        );
        
        if (draftMessages.length > 0) {
            console.log(`Sending ${draftMessages.length} draft messages to ${contactId}`);
            
            // Send each draft message
            draftMessages.forEach(message => {
                // Update message status
                message.status = 'sent';
                
                // Create a new message ID
                const messageId = `msg_${Date.now()}_${messageIdCounter++}`;
                message.id = messageId;
                
                // Send the message
                conn.send({
                    type: 'message',
                    id: message.id,
                    content: message.content,
                    timestamp: message.timestamp,
                    sender: currentUserId
                });
                
                // Update the UI if this is the active contact
                if (activeContact === contactId) {
                    // Find the message element
                    const messageElement = chatMessages.querySelector(`.message[data-id="${message.id}"]`);
                    if (messageElement) {
                        // Update the status icon
                        const statusElement = messageElement.querySelector('.message-status');
                        if (statusElement) {
                            statusElement.className = 'fas fa-check message-status sent';
                        }
                    }
                }
                
                // Store the message in Firebase
                storeMessage(contactId, message);
            });
            
            // Show notification
            showNotification(`Sent ${draftMessages.length} pending messages to ${contactId}`, 'success');
        }
    }
}

/**
 * Update message status (sent, delivered, read)
 * @param {string} contactId - The ID of the contact
 * @param {string} messageId - The ID of the message
 * @param {string} status - The new status ('sent', 'delivered', 'read')
 */
function updateMessageStatus(contactId, messageId, status) {
    // Update the message in memory
    if (conversations[contactId] && conversations[contactId].messages) {
        const messageIndex = conversations[contactId].messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
            // Update the message status
            conversations[contactId].messages[messageIndex].status = status;
            
            // If the message is read, update the read property
            if (status === 'read') {
                conversations[contactId].messages[messageIndex].read = true;
            } else if (status === 'delivered') {
                conversations[contactId].messages[messageIndex].delivered = true;
            }
            
            // Update the message in Firebase
            const userId = firebase.auth().currentUser?.uid;
            if (userId) {
                const chatId = [userId, contactId].sort().join('_');
                firebase.database().ref(`chats/${chatId}/messages/${messageId}`).update({
                    status: status,
                    [status]: true
                }).catch(error => {
                    console.error('Error updating message status:', error);
                });
            }
        }
    }
    
    // Update the UI if this is the active contact
    if (activeContact === contactId) {
        // Find the message element
        const messageElement = chatMessages.querySelector(`.message[data-id="${messageId}"]`);
        if (messageElement) {
            // Update the status icon
            const statusElement = messageElement.querySelector('.message-status');
            if (statusElement) {
                switch (status) {
                    case 'sent':
                        statusElement.className = 'fas fa-check message-status sent';
                        break;
                    case 'delivered':
                        statusElement.className = 'fas fa-check-double message-status delivered';
                        break;
                    case 'read':
                        statusElement.className = 'fas fa-check-double message-status read';
                        break;
                }
            }
        }
    }
}

/**
 * Accept a connection request from another peer
 * @param {string} displayName - The display name of the peer to accept
 */
function acceptConnectionRequest(displayName) {
    const conn = pendingRequests[displayName];
    
    if (!conn) {
        console.error('No pending request from:', displayName);
        return;
    }
    
    // Get the request item to check for actual peer ID
    const requestItem = requestsList.querySelector(`.request-item[data-peer-id="${displayName}"]`);
    const actualPeerId = requestItem?.dataset.actualPeerId || conn.peer;
    
    // Store the connection using the display name for UI consistency
    connections[displayName] = conn;
    
    // Remove from pending requests
    delete pendingRequests[displayName];
    
    // Add the contact to the UI
    addContactToList(displayName, true);
    
    // Store the contact in Firebase with the actual peer ID
    storeContact(displayName, actualPeerId);
    
    // Remove the request from the UI
    removeConnectionRequest(displayName);
    
    // Update the requests count
    updateRequestsCount();
    
    // Send a message to the peer to confirm the connection
    conn.send({
        type: 'connection_accepted',
        timestamp: new Date().toISOString(),
        displayName: firebase.auth().currentUser?.displayName || currentUserId
    });
    
    // Show a success message
    showNotification(`Connected to ${displayName}`, 'success');
}

/**
 * Add a connection request to the UI
 * @param {string} displayName - The display name of the peer requesting connection
 * @param {string} [actualPeerId] - The actual PeerJS ID (if different from displayName)
 */
function addConnectionRequest(displayName, actualPeerId = null) {
    // Check if request already exists
    if (requestsList.querySelector(`.request-item[data-peer-id="${displayName}"]`)) {
        return;
    }
    
    // Create request item element
    const requestItem = document.createElement('div');
    requestItem.className = 'request-item';
    requestItem.dataset.peerId = displayName;
    
    // Store the actual peer ID as a data attribute if provided
    if (actualPeerId && actualPeerId !== displayName) {
        requestItem.dataset.actualPeerId = actualPeerId;
    }
    
    requestItem.innerHTML = `
        <div class="request-info">
            <i class="fas fa-user"></i>
            <span>${displayName}</span>
        </div>
        <div class="request-actions">
            <button class="accept-btn" data-peer-id="${displayName}">
                <i class="fas fa-check"></i> Accept
            </button>
            <button class="reject-btn" data-peer-id="${displayName}">
                <i class="fas fa-times"></i> Reject
            </button>
        </div>
    `;
    
    // Add event listener to accept button
    requestItem.querySelector('.accept-btn').addEventListener('click', function() {
        const requestPeerId = this.dataset.peerId;
        acceptConnectionRequest(requestPeerId);
    });
    
    // Add event listener to reject button
    requestItem.querySelector('.reject-btn').addEventListener('click', function() {
        const requestPeerId = this.dataset.peerId;
        rejectConnectionRequest(requestPeerId);
    });
    
    // Add to requests list
    requestsList.appendChild(requestItem);
    
    // Add a notification badge to the requests section
    updateRequestsCount();
}

/**
 * Update the count of pending requests
 */
function updateRequestsCount() {
    const count = requestsList.querySelectorAll('.request-item').length;
    
    // Get or create the badge element
    let badge = document.querySelector('.requests-badge');
    
    if (!badge && count > 0) {
        // Create a new badge
        badge = document.createElement('span');
        badge.className = 'requests-badge';
        
        // Add it to the requests section heading
        const heading = document.querySelector('.requests-section h3');
        if (heading) {
            heading.appendChild(badge);
        }
    }
    
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * Reject a connection request
 * @param {string} peerId - The ID of the peer to reject
 */
function rejectConnectionRequest(peerId) {
    const conn = pendingRequests[peerId];
    
    if (!conn) {
        console.error('No pending request from:', peerId);
        return;
    }
    
    // Send rejection message if connection is open
    if (conn.open) {
        conn.send({
            type: 'connection_rejected',
            timestamp: new Date().toISOString()
        });
    }
    
    // Close the connection
    conn.close();
    
    // Remove from pending requests
    delete pendingRequests[peerId];
    
    // Remove the request from the UI
    removeConnectionRequest(peerId);
}

/**
 * Remove a connection request from the UI
 * @param {string} peerId - The ID of the peer to remove
 */
function removeConnectionRequest(peerId) {
    const requestItem = requestsList.querySelector(`.request-item[data-peer-id="${peerId}"]`);
    if (requestItem) {
        requestItem.remove();
    }
}

/**
 * Add a contact to the contacts list in the UI
 * @param {string} peerId - The ID of the peer to add
 * @param {boolean} isOnline - Whether the contact is online
 */
function addContactToList(peerId, isOnline = true) {
    // Check if contact already exists in the list
    if (contactsList.querySelector(`.contact-item[data-peer-id="${peerId}"]`)) {
        return;
    }
    
    // Create contact item element
    const contactItem = document.createElement('div');
    contactItem.className = 'contact-item hover-lift';
    contactItem.dataset.peerId = peerId;
    
    contactItem.innerHTML = `
        <div class="contact-avatar">
            <i class="fas fa-user"></i>
            ${isOnline ? '<span class="online-status"></span>' : ''}
        </div>
        <div class="contact-info">
            <div class="contact-name">${peerId}</div>
            <div class="contact-last-message">Click to start chatting</div>
        </div>
        <div class="contact-time"></div>
    `;
    
    // Add to contacts list
    contactsList.appendChild(contactItem);
}

/**
 * Update a contact's online status in the UI
 * @param {string} peerId - The ID of the peer to update
 * @param {boolean} isOnline - Whether the contact is online
 */
function updateContactStatus(peerId, isOnline) {
    const contactItem = contactsList.querySelector(`.contact-item[data-peer-id="${peerId}"]`);
    if (!contactItem) return;
    
    const statusElement = contactItem.querySelector('.online-status');
    
    if (isOnline) {
        if (!statusElement) {
            const avatar = contactItem.querySelector('.contact-avatar');
            const newStatus = document.createElement('span');
            newStatus.className = 'online-status';
            avatar.appendChild(newStatus);
        }
    } else {
        if (statusElement) {
            statusElement.remove();
        }
    }
}

/**
 * Store a contact in Firebase
 * @param {string} contactId - The display name or ID of the contact to store
 * @param {string} [peerId] - The actual PeerJS ID of the contact (if different from contactId)
 */
function storeContact(contactId, peerId = null) {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) return;
    
    // Add to contacts list in Firebase
    firebase.database().ref(`users/${userId}/contacts/${contactId}`).set({
        id: contactId,
        peerId: peerId || contactId, // Store the actual PeerJS ID if provided
        addedAt: firebase.database.ServerValue.TIMESTAMP,
        lastSeen: firebase.database.ServerValue.TIMESTAMP
    }).catch(error => {
        console.error('Error storing contact:', error);
    });
}

/**
 * Update user's online status in Firebase
 * @param {boolean} isOnline - Whether the user is online
 */
function updateUserStatus(isOnline) {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) {
        console.warn('Cannot update user status: No user is logged in');
        return;
    }
    
    // Store status in local storage as a fallback
    try {
        const statusData = {
            online: isOnline,
            lastSeen: new Date().toISOString()
        };
        localStorage.setItem('userStatus', JSON.stringify(statusData));
    } catch (e) {
        console.warn('Could not store user status in local storage:', e);
    }
    
    // Try to update status in Firebase
    try {
        firebase.database().ref(`users/${userId}/status`).set({
            online: isOnline,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            console.log('User status updated in Firebase');
        }).catch(error => {
            console.error('Error updating status in Firebase:', error);
            
            // Only show notification for permission errors and only when going online
            if (isOnline && error.message && error.message.includes('permission_denied')) {
                showNotification('Unable to update online status in Firebase. Some features may be limited.', 'warning');
            }
        });
    } catch (e) {
        console.error('Exception while trying to update user status:', e);
    }
}

/**
 * Load user data from Firebase
 * @param {string} userId - The user's Firebase UID
 */
function loadUserData(userId) {
    // Load contacts
    firebase.database().ref(`users/${userId}/contacts`).once('value')
        .then(snapshot => {
            const contacts = snapshot.val() || {};
            
            // Clear contacts list
            while (contactsList.firstChild) {
                contactsList.removeChild(contactsList.firstChild);
            }
            
            // Add contacts to the UI
            Object.keys(contacts).forEach(contactId => {
                addContactToList(contactId, false); // Initially set as offline
                
                // Check if the contact is online
                firebase.database().ref(`users/${contactId}/status/online`).once('value')
                    .then(onlineSnapshot => {
                        const isOnline = onlineSnapshot.val() || false;
                        updateContactStatus(contactId, isOnline);
                    });
            });
        })
        .catch(error => {
            console.error('Error loading contacts:', error);
        });
}

// File Attachment Functionality
// DOM Elements
const attachFileBtn = document.getElementById('attachFileBtn');
const fileInput = document.getElementById('fileInput');
const filePreviewContainer = document.getElementById('filePreviewContainer');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const closeFilePreviewBtn = document.getElementById('closeFilePreviewBtn');
const cancelFileBtn = document.getElementById('cancelFileBtn');
const sendFileBtn = document.getElementById('sendFileBtn');
const fileTransferProgress = document.getElementById('fileTransferProgress');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// File data
let selectedFile = null;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Event Listeners
attachFileBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', handleFileSelection);
closeFilePreviewBtn.addEventListener('click', closeFilePreview);
cancelFileBtn.addEventListener('click', closeFilePreview);
sendFileBtn.addEventListener('click', sendFile);

/**
 * Handle file selection
 * @param {Event} event - The change event
 */
function handleFileSelection(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        showNotification('File size exceeds the maximum limit of 10MB.', 'error');
        fileInput.value = '';
        return;
    }
    
    selectedFile = file;
    
    // Update file preview
    updateFilePreview(file);
    
    // Show file preview container
    filePreviewContainer.style.display = 'block';
    
    // Reset progress
    fileTransferProgress.style.display = 'none';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
}

/**
 * Update file preview
 * @param {File} file - The selected file
 */
function updateFilePreview(file) {
    // Display file name and size
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // Clear previous preview
    filePreview.innerHTML = '';
    
    // Check if file is an image
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        filePreview.appendChild(img);
    } else {
        // Display file icon based on type
        const icon = getFileIcon(file.type);
        filePreview.innerHTML = `<i class="${icon}"></i>`;
    }
}

/**
 * Get file icon based on file type
 * @param {string} fileType - The MIME type of the file
 * @returns {string} - The Font Awesome icon class
 */
function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) {
        return 'fas fa-file-image';
    } else if (fileType.startsWith('video/')) {
        return 'fas fa-file-video';
    } else if (fileType.startsWith('audio/')) {
        return 'fas fa-file-audio';
    } else if (fileType.includes('pdf')) {
        return 'fas fa-file-pdf';
    } else if (fileType.includes('word') || fileType.includes('document')) {
        return 'fas fa-file-word';
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
        return 'fas fa-file-excel';
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
        return 'fas fa-file-powerpoint';
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
        return 'fas fa-file-archive';
    } else if (fileType.includes('text')) {
        return 'fas fa-file-alt';
    } else if (fileType.includes('code') || fileType.includes('javascript') || fileType.includes('html') || fileType.includes('css')) {
        return 'fas fa-file-code';
    } else {
        return 'fas fa-file';
    }
}

/**
 * Format file size to human-readable format
 * @param {number} bytes - The file size in bytes
 * @returns {string} - Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Close file preview
 */
function closeFilePreview() {
    filePreviewContainer.style.display = 'none';
    fileInput.value = '';
    selectedFile = null;
}

/**
 * Send file to recipient
 */
function sendFile() {
    if (!selectedFile || !activeContact) {
        return;
    }
    
    const recipientId = activeContact;
    const conn = connections[recipientId];
    
    if (!conn || !conn.open) {
        showNotification(`No active connection to ${recipientId}. Cannot send file.`, 'error');
        return;
    }
    
    // Show progress container
    fileTransferProgress.style.display = 'block';
    
    // Disable send button
    sendFileBtn.disabled = true;
    
    // Generate a unique file ID
    const fileId = `file_${Date.now()}_${messageIdCounter++}`;
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const fileData = event.target.result;
        
        // Create file metadata
        const fileMetadata = {
            type: 'file',
            id: fileId,
            name: selectedFile.name,
            size: selectedFile.size,
            mimeType: selectedFile.type,
            timestamp: new Date().toISOString(),
            sender: currentUserId,
            status: 'sent'
        };
        
        // Send file metadata first
        conn.send(fileMetadata);
        
        // Update progress to 10%
        updateProgress(10);
        
        // For small files, send in one chunk
        if (selectedFile.size < 100 * 1024) { // Less than 100KB
            // Send file data
            conn.send({
                type: 'file-data',
                id: fileId,
                data: fileData,
                complete: true
            });
            
            // Update progress to 100%
            updateProgress(100);
            
            // Complete the file transfer
            completeFileTransfer(fileMetadata, recipientId);
        } else {
            // For larger files, send in chunks
            const chunkSize = 64 * 1024; // 64KB chunks
            const totalChunks = Math.ceil(fileData.byteLength / chunkSize);
            let sentChunks = 0;
            
            // Function to send a chunk
            function sendChunk(start) {
                const end = Math.min(start + chunkSize, fileData.byteLength);
                const chunk = fileData.slice(start, end);
                const isLastChunk = end === fileData.byteLength;
                
                // Send chunk
                conn.send({
                    type: 'file-data',
                    id: fileId,
                    data: chunk,
                    chunkIndex: sentChunks,
                    totalChunks: totalChunks,
                    complete: isLastChunk
                });
                
                sentChunks++;
                
                // Update progress
                const progress = Math.round((sentChunks / totalChunks) * 90) + 10;
                updateProgress(progress);
                
                // If not the last chunk, send the next chunk
                if (!isLastChunk) {
                    setTimeout(() => sendChunk(end), 50);
                } else {
                    // Complete the file transfer
                    completeFileTransfer(fileMetadata, recipientId);
                }
            }
            
            // Start sending chunks
            sendChunk(0);
        }
    };
    
    reader.onerror = function() {
        showNotification('Error reading file.', 'error');
        sendFileBtn.disabled = false;
    };
    
    // Read the file as ArrayBuffer
    reader.readAsArrayBuffer(selectedFile);
}

/**
 * Update progress bar
 * @param {number} percent - The progress percentage
 */
function updateProgress(percent) {
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}%`;
}

/**
 * Complete file transfer
 * @param {Object} fileMetadata - The file metadata
 * @param {string} recipientId - The recipient ID
 */
function completeFileTransfer(fileMetadata, recipientId) {
    // Store in memory conversation
    if (!conversations[recipientId]) {
        conversations[recipientId] = { messages: [], lastRead: null, typing: false };
    }
    
    conversations[recipientId].messages.push(fileMetadata);
    
    // Display the file message
    displayFileMessage(fileMetadata, recipientId);
    
    // Update last message in contact list
    updateLastMessage(recipientId, `File: ${fileMetadata.name}`, new Date(fileMetadata.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    
    // Store the file metadata in Firebase
    storeMessage(recipientId, fileMetadata);
    
    // Close file preview
    setTimeout(() => {
        closeFilePreview();
        sendFileBtn.disabled = false;
    }, 1000);
    
    // Scroll to bottom
    scrollToBottom();
}

/**
 * Display file message
 * @param {Object} fileData - The file data
 * @param {string} contactId - The contact ID
 */
function displayFileMessage(fileData, contactId) {
    // Determine if this is a sent or received message
    const isSent = fileData.sender === currentUserId;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
    messageElement.dataset.id = fileData.id;
    messageElement.dataset.timestamp = fileData.timestamp;
    
    // Format timestamp
    const messageDate = new Date(fileData.timestamp);
    const timeString = messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Determine message status icon
    let statusIcon = '';
    if (isSent) {
        if (fileData.read) {
            statusIcon = '<i class="fas fa-check-double message-status read"></i>';
        } else if (fileData.delivered) {
            statusIcon = '<i class="fas fa-check-double message-status delivered"></i>';
        } else {
            statusIcon = '<i class="fas fa-check message-status sent"></i>';
        }
    }
    
    // Get file icon
    const fileIcon = getFileIcon(fileData.mimeType);
    
    // Build message HTML
    messageElement.innerHTML = `
        <div class="message-content">
            <div class="file-attachment" data-file-id="${fileData.id}">
                <div class="file-attachment-icon">
                    <i class="${fileIcon}"></i>
                </div>
                <div class="file-attachment-info">
                    <div class="file-attachment-name">${fileData.name}</div>
                    <div class="file-attachment-size">${formatFileSize(fileData.size)}</div>
                </div>
                <div class="file-attachment-download">
                    <i class="fas fa-download"></i>
                </div>
            </div>
        </div>
        <div class="message-time">${timeString} ${statusIcon}</div>
    `;
    
    // Add to chat
    chatMessages.appendChild(messageElement);
    
    // Add click event for file download
    const fileAttachment = messageElement.querySelector('.file-attachment');
    if (fileAttachment) {
        fileAttachment.addEventListener('click', () => {
            // Handle file download or preview
            if (isSent) {
                showNotification('This is your sent file.', 'info');
            } else {
                const fileId = fileData.id;
                
                // Check if we have the file data
                if (receivedFiles[fileId] && receivedFiles[fileId].complete) {
                    downloadFile(fileData.name, fileData.mimeType, receivedFiles[fileId].data);
                } else {
                    showNotification('File is not fully received yet. Please wait.', 'warning');
                }
            }
        });
    }
}

// Store received files data
const receivedFiles = {};

/**
 * Download a file
 * @param {string} fileName - The name of the file
 * @param {string} mimeType - The MIME type of the file
 * @param {ArrayBuffer} data - The file data
 */
function downloadFile(fileName, mimeType, data) {
    try {
        // Show notification
        showNotification('Downloading file...', 'info');
        
        // Create a blob from the data
        const blob = new Blob([data], { type: mimeType || 'application/octet-stream' });
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        
        // Add to document, click it, and remove it
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('File downloaded successfully!', 'success');
        }, 100);
    } catch (error) {
        console.error('Error downloading file:', error);
        showNotification('Error downloading file. Please try again.', 'error');
    }
}

/**
 * Process received file data
 * @param {string} senderId - The sender ID
 * @param {Object} fileData - The file data
 */
function processReceivedFile(senderId, fileData) {
    // Store file metadata
    if (fileData.type === 'file') {
        // Initialize file storage for this file ID
        receivedFiles[fileData.id] = {
            metadata: fileData,
            chunks: [],
            complete: false,
            data: null
        };
        
        // Store in memory conversation
        if (!conversations[senderId]) {
            conversations[senderId] = { messages: [], lastRead: null, typing: false };
        }
        
        conversations[senderId].messages.push(fileData);
        
        // If this is the active contact, display the file message
        if (activeContact === senderId) {
            displayFileMessage(fileData, senderId);
            scrollToBottom();
            
            // Mark as read
            markMessagesAsRead(senderId);
        } else {
            // Update unread status
            updateContactUnread(senderId, true);
        }
        
        // Update last message in contact list
        updateLastMessage(senderId, `File: ${fileData.name}`, new Date(fileData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        
        // Store the file metadata in Firebase
        storeMessage(senderId, fileData);
        
        // Send delivery receipt
        sendDeliveryReceipt(senderId, fileData.id);
    }
    
    // Process file data chunks
    if (fileData.type === 'file-data') {
        const fileId = fileData.id;
        
        // Check if we have metadata for this file
        if (!receivedFiles[fileId]) {
            console.error('Received file data for unknown file ID:', fileId);
            return;
        }
        
        // For small files sent in one chunk
        if (fileData.complete && !fileData.chunkIndex) {
            receivedFiles[fileId].data = fileData.data;
            receivedFiles[fileId].complete = true;
            
            // Show notification
            showNotification(`File received from ${senderId}`, 'success');
            return;
        }
        
        // For chunked files
        if (fileData.chunkIndex !== undefined && fileData.totalChunks) {
            // Store the chunk
            receivedFiles[fileId].chunks[fileData.chunkIndex] = fileData.data;
            
            // Check if all chunks are received
            if (fileData.complete) {
                // Combine all chunks
                const fileChunks = receivedFiles[fileId].chunks;
                
                // Calculate total length
                let totalLength = 0;
                for (const chunk of fileChunks) {
                    if (chunk) {
                        totalLength += chunk.byteLength;
                    }
                }
                
                // Create a new ArrayBuffer to hold the complete file
                const completeFile = new Uint8Array(totalLength);
                
                // Copy all chunks into the complete file
                let offset = 0;
                for (const chunk of fileChunks) {
                    if (chunk) {
                        completeFile.set(new Uint8Array(chunk), offset);
                        offset += chunk.byteLength;
                    }
                }
                
                // Store the complete file
                receivedFiles[fileId].data = completeFile.buffer;
                receivedFiles[fileId].complete = true;
                
                // Show notification
                showNotification(`File received from ${senderId}`, 'success');
            }
        }
    }
}

// Emoji Picker Functionality
// DOM Elements
const emojiBtn = document.getElementById('emojiBtn');
const emojiPickerContainer = document.getElementById('emojiPickerContainer');
let emojiPicker = null;

// Initialize emoji picker
function initEmojiPicker() {
    // Create emoji picker if it doesn't exist
    if (!emojiPicker) {
        // Create the emoji-picker element
        emojiPicker = document.createElement('emoji-picker');
        
        // Add it to the container
        emojiPickerContainer.appendChild(emojiPicker);
        
        // Listen for emoji selection
        emojiPicker.addEventListener('emoji-click', event => {
            // Get the selected emoji
            const emoji = event.detail.unicode;
            
            // Get the message input
            const messageInput = document.getElementById('messageInput');
            
            // Get cursor position
            const cursorPos = messageInput.selectionStart;
            
            // Insert emoji at cursor position
            const textBefore = messageInput.value.substring(0, cursorPos);
            const textAfter = messageInput.value.substring(cursorPos);
            
            // Insert the emoji directly (it will be encoded when sent)
            messageInput.value = textBefore + emoji + textAfter;
            
            // Set cursor position after the inserted emoji
            messageInput.selectionStart = cursorPos + emoji.length;
            messageInput.selectionEnd = cursorPos + emoji.length;
            
            // Focus back on the input
            messageInput.focus();
            
            // Hide the emoji picker
            toggleEmojiPicker(false);
        });
    }
}

// Toggle emoji picker visibility
function toggleEmojiPicker(show) {
    if (show === undefined) {
        // Toggle if no parameter is provided
        show = emojiPickerContainer.style.display === 'none';
    }
    
    // Show or hide the picker
    emojiPickerContainer.style.display = show ? 'block' : 'none';
    
    // Initialize the picker if showing
    if (show) {
        initEmojiPicker();
    }
}

// Event Listeners
emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent document click from immediately closing it
    toggleEmojiPicker();
});

// Close emoji picker when clicking outside
document.addEventListener('click', (e) => {
    // Check if the click is outside the emoji picker and button
    if (emojiPickerContainer.style.display === 'block' && 
        !emojiPickerContainer.contains(e.target) && 
        e.target !== emojiBtn && 
        !emojiBtn.contains(e.target)) {
        toggleEmojiPicker(false);
    }
});

// Keyboard shortcut for emoji picker (Ctrl+E)
document.addEventListener('keydown', (e) => {
    // Check if Ctrl+E is pressed and message input is focused
    if (e.ctrlKey && e.key === 'e' && document.activeElement === messageInput) {
        e.preventDefault(); // Prevent default browser behavior
        toggleEmojiPicker();
    }
    
    // Close emoji picker and dropdown menu on Escape key
    if (e.key === 'Escape') {
        if (emojiPickerContainer.style.display === 'block') {
            toggleEmojiPicker(false);
        }
        if (moreOptionsMenu.style.display === 'block') {
            toggleMoreOptionsMenu(false);
        }
    }
});

// More Options Menu Functionality
const moreOptionsBtn = document.getElementById('moreOptionsBtn');
const moreOptionsMenu = document.getElementById('moreOptionsMenu');
const clearChatBtn = document.getElementById('clearChatBtn');
const unfriendBtn = document.getElementById('unfriendBtn');

// Toggle more options menu
function toggleMoreOptionsMenu(show) {
    if (show === undefined) {
        // Toggle if no parameter is provided
        show = moreOptionsMenu.style.display === 'none';
    }
    
    // Show or hide the menu
    moreOptionsMenu.style.display = show ? 'block' : 'none';
}

// Event Listeners
moreOptionsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent document click from immediately closing it
    toggleMoreOptionsMenu();
});

// Close more options menu when clicking outside
document.addEventListener('click', (e) => {
    // Check if the click is outside the more options menu and button
    if (moreOptionsMenu.style.display === 'block' && 
        !moreOptionsMenu.contains(e.target) && 
        e.target !== moreOptionsBtn && 
        !moreOptionsBtn.contains(e.target)) {
        toggleMoreOptionsMenu(false);
    }
});

// Clear Chat functionality
clearChatBtn.addEventListener('click', () => {
    if (!activeContact) {
        showNotification('No active chat to clear.', 'warning');
        toggleMoreOptionsMenu(false);
        return;
    }
    
    // Show confirmation dialog
    if (confirm(`Are you sure you want to clear all messages with ${activeContact}? This action cannot be undone.`)) {
        // Clear messages from the UI
        chatMessages.innerHTML = '';
        
        // Clear messages from memory
        if (conversations[activeContact]) {
            conversations[activeContact].messages = [];
        }
        
        // Update last message in contact list
        updateLastMessage(activeContact, 'No messages');
        
        // Clear messages from Firebase (optional - only clears from current user's perspective)
        clearMessagesInFirebase(activeContact);
        
        // Show notification
        showNotification('Chat history cleared.', 'success');
    }
    
    // Close the menu
    toggleMoreOptionsMenu(false);
});

// Unfriend/Remove Contact functionality
unfriendBtn.addEventListener('click', () => {
    if (!activeContact) {
        showNotification('No contact selected.', 'warning');
        toggleMoreOptionsMenu(false);
        return;
    }
    
    // Show confirmation dialog
    if (confirm(`Are you sure you want to remove ${activeContact} from your contacts? This action cannot be undone.`)) {
        // Close the connection
        if (connections[activeContact]) {
            connections[activeContact].close();
            delete connections[activeContact];
        }
        
        // Remove from contacts list in UI
        const contactItem = contactsList.querySelector(`.contact-item[data-peer-id="${activeContact}"]`);
        if (contactItem) {
            contactItem.remove();
        }
        
        // Remove from memory
        delete conversations[activeContact];
        
        // Remove from Firebase
        removeContactFromFirebase(activeContact);
        
        // Clear chat window
        chatMessages.innerHTML = '';
        currentChatName.textContent = 'Select a contact';
        
        // Reset active contact
        activeContact = null;
        
        // Show welcome screen
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'flex';
        }
        
        // Show notification
        showNotification('Contact removed successfully.', 'success');
    }
    
    // Close the menu
    toggleMoreOptionsMenu(false);
});

// Handle colon shortcut for emoji picker
messageInput.addEventListener('input', (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Check if user typed a colon
    if (value[cursorPos - 1] === ':' && (cursorPos === 1 || value[cursorPos - 2] === ' ')) {
        // Open emoji picker
        toggleEmojiPicker(true);
    }
});

// Initialize welcome screen
document.addEventListener('DOMContentLoaded', () => {
    // Show welcome screen if no contact is selected
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen && !activeContact) {
        welcomeScreen.style.display = 'flex';
    }
});

/**
 * Clear messages with a contact in Firebase
 * @param {string} contactId - The ID of the contact
 */
function clearMessagesInFirebase(contactId) {
    if (!firebase.auth().currentUser) return;
    
    const userId = firebase.auth().currentUser.uid;
    
    // Create a conversation ID that's the same regardless of who initiated
    const conversationId = [userId, contactId].sort().join('_');
    
    // Reference to the messages in this conversation
    const messagesRef = firebase.database().ref(`messages/${conversationId}`);
    
    // Remove all messages
    messagesRef.remove()
        .then(() => {
            console.log(`Cleared messages with ${contactId} in Firebase`);
        })
        .catch(error => {
            console.error('Error clearing messages in Firebase:', error);
        });
}

/**
 * Remove a contact from Firebase
 * @param {string} contactId - The ID of the contact to remove
 */
function removeContactFromFirebase(contactId) {
    if (!firebase.auth().currentUser) return;
    
    const userId = firebase.auth().currentUser.uid;
    
    // Reference to the contact in the user's contacts list
    const contactRef = firebase.database().ref(`users/${userId}/contacts/${contactId}`);
    
    // Remove the contact
    contactRef.remove()
        .then(() => {
            console.log(`Removed ${contactId} from contacts in Firebase`);
        })
        .catch(error => {
            console.error('Error removing contact in Firebase:', error);
        });
}