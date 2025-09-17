export function getMsg() {
    firebase
    .firestore()
    .collection('chat')
    .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                console.log('New message: ', change.doc.data().message);
                
                // Create container for message and buttons
                let messageContainer = document.createElement('div');
                messageContainer.setAttribute('data-doc-id', change.doc.id); // Store doc ID
                
                let pTag = document.createElement('p');
                pTag.innerText = `Message : ${change.doc.data().message}`;
                
                let editButtonTag = document.createElement('button');
                editButtonTag.innerText = "edit";
                
                let deleteButtonTag = document.createElement('button');
                deleteButtonTag.innerText = "delete";
                
                // Append to container
                messageContainer.appendChild(pTag);
                messageContainer.appendChild(editButtonTag);
                messageContainer.appendChild(deleteButtonTag);
                
                // Add event listeners
                editButtonTag.addEventListener('click', () => {
                    let newMessage = prompt('Edit message:', change.doc.data().message);
                    if (newMessage) {
                        firebase.firestore().collection('chat').doc(change.doc.id).update({ message: newMessage })
                            .then(() => console.log('Message updated'))
                            .catch(error => console.error('Error updating:', error));
                    }
                });
                
                deleteButtonTag.addEventListener('click', () => {
                    firebase.firestore().collection('chat').doc(change.doc.id).delete()
                        .then(() => {
                            messageContainer.remove(); // Remove from DOM
                            console.log('Message deleted');
                        })
                        .catch(error => console.error('Error deleting:', error));
                });
                
                const chatContainer = document.getElementById('chat');
                chatContainer.appendChild(messageContainer);
            }
        });
    });
}