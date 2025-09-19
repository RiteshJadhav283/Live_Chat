// Import Firebase configuration from the parent directory
import { firebaseConfig } from '../config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const onlineUsersList = document.getElementById('online-users');
const userAvatar = document.getElementById('user-avatar');
const currentUserElement = document.getElementById('current-user');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editMessageText = document.getElementById('edit-message-text');
const saveEditBtn = document.getElementById('save-edit');
const cancelEditBtn = document.getElementById('cancel-edit');
const closeModalBtn = document.querySelector('.close-btn');

// State
let currentUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: 'User ' + Math.floor(Math.random() * 1000),
    avatar: 'U'
};

let currentEditingMessageId = null;

// Initialize the app
function initApp() {
    // Set current user info
    currentUser.avatar = currentUser.name.charAt(0).toUpperCase();
    userAvatar.textContent = currentUser.avatar;
    currentUserElement.textContent = currentUser.name;
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up real-time listeners
    setupRealtimeListeners();
    
    // Set up online status
    setupOnlineStatus();
    
    // Show welcome message
    showWelcomeMessage();
}

// Set up event listeners
function setupEventListeners() {
    // Message input
    messageInput.addEventListener('input', adjustTextareaHeight);
    messageInput.addEventListener('keydown', handleKeyDown);
    
    // Send button
    sendButton.addEventListener('click', sendMessage);
    
    // Modal buttons
    saveEditBtn.addEventListener('click', saveEditedMessage);
    cancelEditBtn.addEventListener('click', closeEditModal);
    closeModalBtn.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// Set up real-time Firestore listeners
function setupRealtimeListeners() {
    // Listen for new messages
    db.collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(handleMessagesUpdate);
    
    // Listen for online users
    db.collection('status')
        .where('state', '==', 'online')
        .onSnapshot(handleOnlineUsersUpdate);
}

// Handle messages update
function handleMessagesUpdate(snapshot) {
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            const message = {
                id: change.doc.id,
                ...change.doc.data()
            };
            displayMessage(message);
        } else if (change.type === 'modified') {
            updateMessage(change.doc.id, change.doc.data());
        } else if (change.type === 'removed') {
            removeMessage(change.doc.id);
        }
    });
    
    // Scroll to bottom
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Handle online users update
function handleOnlineUsersUpdate(snapshot) {
    onlineUsersList.innerHTML = '';
    let usersCount = 0;
    
    snapshot.forEach(doc => {
        const user = doc.data();
        if (user.userId !== currentUser.id) {
            const userItem = document.createElement('li');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <span class="user-status"></span>
                <span>${user.userName || 'Anonymous'}</span>
            `;
            onlineUsersList.appendChild(userItem);
            usersCount++;
        }
    });
    
    if (usersCount === 0) {
        const noUsers = document.createElement('li');
        noUsers.className = 'user-item';
        noUsers.textContent = 'No other users online';
        onlineUsersList.appendChild(noUsers);
    }
}

// Set up online status
function setupOnlineStatus() {
    const userStatusRef = db.collection('status').doc(currentUser.id);
    
    const isOfflineForDatabase = {
        state: 'offline',
        lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
        userId: currentUser.id,
        userName: currentUser.name
    };
    
    const isOnlineForDatabase = {
        state: 'online',
        lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
        userId: currentUser.id,
        userName: currentUser.name
    };
    
    // Set user as online
    db.collection('status')
        .doc(currentUser.id)
        .set(isOnlineForDatabase, { merge: true });
    
    // Set user as offline when window closes
    window.addEventListener('beforeunload', () => {
        userStatusRef.set(isOfflineForDatabase, { merge: true });
    });
}

// Display a message in the chat
function displayMessage(message) {
    // Check if message already exists
    if (document.getElementById(`message-${message.id}`)) {
        return;
    }
    
    const isCurrentUser = message.userId === currentUser.id;
    const messageTime = message.timestamp ? 
        formatTime(message.timestamp.toDate()) : 
        formatTime(new Date());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
    messageDiv.id = `message-${message.id}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${!isCurrentUser ? `<div class="message-sender">${message.userName || 'Anonymous'}</div>` : ''}
            <div class="message-text">${message.text}</div>
            <div class="message-time">${messageTime} ${message.edited ? '(edited)' : ''}</div>
            ${isCurrentUser ? `
            <div class="message-actions">
                <button class="message-action" title="Edit" data-message-id="${message.id}">
                    <i class="material-icons" style="font-size: 16px;">edit</i>
                </button>
                <button class="message-action" title="Delete" data-message-id="${message.id}">
                    <i class="material-icons" style="font-size: 16px;">delete</i>
                </button>
            </div>
            ` : ''}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Add event listeners to action buttons
    if (isCurrentUser) {
        const editBtn = messageDiv.querySelector('.message-action:first-child');
        const deleteBtn = messageDiv.querySelector('.message-action:last-child');
        
        editBtn.addEventListener('click', () => openEditModal(message.id, message.text));
        deleteBtn.addEventListener('click', () => deleteMessage(message.id));
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Update an existing message
function updateMessage(messageId, newData) {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
        const messageText = messageElement.querySelector('.message-text');
        const messageTime = messageElement.querySelector('.message-time');
        
        if (messageText) messageText.textContent = newData.text;
        if (messageTime) {
            const time = newData.timestamp ? 
                formatTime(newData.timestamp.toDate()) : 
                formatTime(new Date());
            messageTime.innerHTML = `${time} ${newData.edited ? '(edited)' : ''}`;
        }
    }
}

// Remove a message
function removeMessage(messageId) {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
        messageElement.remove();
    }
}

// Send a new message
async function sendMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText) return;
    
    try {
        await db.collection('messages').add({
            text: messageText,
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            edited: false
        });
        
        // Clear input
        messageInput.value = '';
        adjustTextareaHeight();
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    }
}

// Open edit modal
function openEditModal(messageId, currentText) {
    currentEditingMessageId = messageId;
    editMessageText.value = currentText;
    editModal.style.display = 'flex';
    editMessageText.focus();
    
    // Select all text
    editMessageText.setSelectionRange(0, currentText.length);
}

// Close edit modal
function closeEditModal() {
    editModal.style.display = 'none';
    currentEditingMessageId = null;
    editMessageText.value = '';
}

// Save edited message
async function saveEditedMessage() {
    const newText = editMessageText.value.trim();
    if (!newText || !currentEditingMessageId) {
        closeEditModal();
        return;
    }
    
    try {
        await db.collection('messages').doc(currentEditingMessageId).update({
            text: newText,
            edited: true,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeEditModal();
    } catch (error) {
        console.error('Error updating message:', error);
        alert('Failed to update message. Please try again.');
    }
}

// Delete a message
async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    
    try {
        await db.collection('messages').doc(messageId).delete();
    } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message. Please try again.');
    }
}

// Handle key down events
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// Adjust textarea height based on content
function adjustTextareaHeight() {
    messageInput.style.height = 'auto';
    messageInput.style.height = (messageInput.scrollHeight) + 'px';
    
    // Enable/disable send button
    sendButton.disabled = messageInput.value.trim() === '';
}

// Format time to HH:MM
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Show welcome message
function showWelcomeMessage() {
    const welcomeMessage = {
        id: 'welcome',
        text: 'Welcome to the chat! Start sending messages.',
        userId: 'system',
        userName: 'System',
        timestamp: new Date()
    };
    
    // Show welcome message after a short delay
    setTimeout(() => {
        displayMessage(welcomeMessage);
    }, 500);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
