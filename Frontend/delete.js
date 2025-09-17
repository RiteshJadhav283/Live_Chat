export function deleteMessage(docId) 
{
    try{
        firebase.firestore().collection('chat')}
    catch(error){
        console.error('Error  deleting message: ', error);
    }
}