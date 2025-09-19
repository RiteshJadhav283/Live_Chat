let file=document.getElementById('file-input').files[0];
        let uploadBtn=document.getElementById('upload-btn');

        uploadBtn.addEventListener('click', async()=>{
            await uploadMedia(file);
        });
        async function uploadMedia(file)
         {
            try 
            {
                const storageRef = firebase.storage().ref();
                const folderref = rootRef.child('profilePic');

                let fileRef = folderref.child(file.name);
                console.log(file.name);
                await fileRef.put(file);
            } catch (error) 
            {
                console.error("Error uploading media: ", error);
                return null;
            }
         }