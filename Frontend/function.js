import {deleteMessage} from "./delete.js";

export function getMsg() {
    firebase.firestore().collection('jh-Chat').onSnapshot(changes => {
        changes.docChanges().forEach((changes) =>{
            if(changes.type == 'added'){
                let pTag = document.createElement('p');
                let editbuttonTag = document.createElement('button');
                editbuttonTag.innerText = "edit";

                let deletebuttonTag = document.createElement('button');
                deletebuttonTag.innerText ="delete";
                // deletebuttonTag.setAttribute("id ","button-");
               
                console.log(`Here Message : ${changes.doc.id}`);
                pTag.innerText = `message : ${changes.doc.data().message}`;

                let chatContainer = document.getElementById('chat');
                chatContainer.appendChild(pTag);
                chatContainer.appendChild(editbuttonTag);
                chatContainer.appendChild(deletebuttonTag);
                deletebuttonTag.addEventListener('click', () => {
                    deleteMessage(changes.doc.id);
                })


            }
        })
    })
}