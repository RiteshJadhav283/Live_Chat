export function getMsg() {
    firebase
        .firestore()
        .collection('chat')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    // Create message container
                    const messageContainer = document.createElement('div');
                    messageContainer.className = 'message';
                    messageContainer.id = `msg-${change.doc.id}`;

                    // Create message text
                    const messageText = document.createElement('p');
                    messageText.textContent = change.doc.data().message;

                    // Create buttons container
                    const buttonsContainer = document.createElement('div');
                    buttonsContainer.className = 'message-buttons';

                    // Create edit button
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.onclick = () => editMessage(change.doc.id);

                    // Create delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.onclick = () => deleteMessage(change.doc.id);

                    // Append elements
                    buttonsContainer.appendChild(editButton);
                    buttonsContainer.appendChild(deleteButton);
                    messageContainer.appendChild(messageText);
                    messageContainer.appendChild(buttonsContainer);

                    // Add to chat
                    const chatContainer = document.getElementById('chat');
                    chatContainer.insertBefore(messageContainer, chatContainer.firstChild);
                }
                if (change.type === 'removed') {
                    // Remove deleted message from DOM
                    const messageElement = document.getElementById(`msg-${change.doc.id}`);
                    if (messageElement) {
                        messageElement.remove();
                    }
                }
                if (change.type === 'modified') {
                    // Update modified message in DOM
                    const messageElement = document.getElementById(`msg-${change.doc.id}`);
                    if (messageElement) {
                        const messageText = messageElement.querySelector('p');
                        messageText.textContent = change.doc.data().message;
                    }
                }
            });
        }, (error) => {
            console.error('Error listening to messages:', error);
        });
}

// Function to edit message
async function editMessage(messageId) {
    try {
        const docRef = firebase.firestore().collection('chat').doc(messageId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const currentMessage = doc.data().message;
            const newMessage = prompt('Edit message:', currentMessage);
            
            if (newMessage && newMessage !== currentMessage) {
                await docRef.update({
                    message: newMessage,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }
    } catch (error) {
        console.error('Error editing message:', error);
    }
}

// Function to delete message
async function deleteMessage(messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
        try {
            await firebase.firestore().collection('chat').doc(messageId).delete();
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    }
}