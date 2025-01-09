import * as myFunc from "/assets/notesFunctions.js";
const dialog_note = document.getElementById('newNoteText');
const dialog_title = document.getElementById('newNoteTitle');
let noteIndex;
let searchBoolean = false;

const loadUserValues = async () => {
    // Getting the user
    let user = await myFunc.getUser();

    // Send notes
    myFunc.sendNotes(user);

    // Sending user wellcome
    document.getElementById('user_hello').textContent = user.login;

    return user;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        let user = await loadUserValues();

        // Add note
        document.getElementById('firstNote_btn').addEventListener('click', (node) => {
            document.getElementById('submit_newNote').classList.toggle('hidden');
            document.getElementById('dialog_title').textContent = 'Add new note';
            document.getElementById('addItem').showModal();
            document.getElementById('newNoteText').value = ''
            document.getElementById('newNoteText').placeholder = 
            `
            Formattings (Some of them is only applied in a new line):
            # -> Strong title
            ##, ### -> Less strong title
            ** Something ** -> Emphasis
            __ Something __ -> Italic
            [Something](URL) -> Link
            ![Something](URL) -> Image
            * -> List
            `;
            document.getElementById('newNoteTitle').value = '';
        })

        document.getElementById('add_newNote').addEventListener('click', (node) => {
            document.getElementById('submit_newNote').classList.toggle('hidden');
            document.getElementById('dialog_title').textContent = 'Add new note';
            document.getElementById('addItem').showModal();
            document.getElementById('newNoteText').value = ''
            document.getElementById('newNoteText').placeholder = 
            `
            Formattings (Some of them is only applied in a new line):
            # -> Strong title
            ##, ### -> Less strong title
            ** Something ** -> Emphasis
            __ Something __ -> Italic
            [Something](URL) -> Link
            ![Something](URL) -> Image
            * -> List
            `;
            document.getElementById('newNoteTitle').value = '';
        })

        // Edit Note
        Array.from(document.getElementsByClassName('editNote')).forEach((node, i) => {
            node.addEventListener('click', () => {
                document.getElementById('submit_editNote').classList.toggle('hidden');
                document.getElementById('dialog_title').textContent = 'Edit Note';
                document.getElementById('addItem').showModal();

                noteIndex = node.id.replace(/(editNote_)/, '');
                let noFormated = user.notes[i].note;
                let formatedTxt = myFunc.formatText(noFormated);
                document.getElementById('newNoteText').value = noFormated;
                document.getElementById('newNoteTitle').value = document.getElementById(`noteTitle_${noteIndex}`).textContent;
            });
        });

        // Delete Note
        Array.from(document.getElementsByClassName('deleteNote')).forEach((node) => {
            node.addEventListener('click', () => {
                document.getElementById('submit_removeNote').classList.toggle('hidden');
                document.getElementById('dialog_title').textContent = 'Delete Note';
                document.getElementById('addItem').showModal();

                noteIndex = node.id.replace(/(deleteNote_)/, '');
                console.log(noteIndex)
                // console.log(document.getElementById(`note_text_${noteIndex}`).textContent)
                
                document.getElementById('newNoteText').value = document.getElementById(`note_text_${noteIndex}`).textContent.replace(/^\s*/, '');
                document.getElementById('newNoteTitle').value = document.getElementById(`noteTitle_${noteIndex}`).textContent;
            });
        });

        // Search Note
        document.getElementById('search_note').addEventListener('click', () => myFunc.searchNote());

        // Give the button roles
        document.getElementById('submit_newNote').addEventListener('click', async (node) => {
            if (dialog_title.value.length === 0) {
                alert('Write a title!');
                return;
            } else if (dialog_note.value.length === 0) {
                alert('Write something in the notes!');
                return;
            }

            try {
                document.getElementById('dialog_wait').classList.toggle('hidden');
                await myFunc.createNewNote(dialog_title.value, dialog_note.value);
                window.location.href = "http://localhost:8080/notes"; 
            } catch (error) {
                
            }
        })

        document.getElementById('submit_editNote').addEventListener('click', async (node) => {
            if (dialog_title.value.length === 0) {
                alert('Write a title!');
                return;
            } else if (dialog_note.value.length === 0) {
                alert('Write something in the notes!');
                return;
            }

            try {
                document.getElementById('dialog_wait').classList.toggle('hidden');
                await myFunc.editNote(dialog_title.value, dialog_note.value, noteIndex);
                window.location.href = "http://localhost:8080/notes"; 
            } catch (error) {
                
            }
        })            
        
        document.getElementById('submit_removeNote').addEventListener('click', async (node) => {
            if (dialog_title.value.length === 0) {
                alert('Write a title!');
                return;
            } else if (dialog_note.value.length === 0) {
                alert('Write something in the notes!');
                return;
            }

            try {
                document.getElementById('dialog_wait').classList.toggle('hidden');
                await myFunc.deleteNote(noteIndex);
                window.location.href = "http://localhost:8080/notes"; 
            } catch (error) {
                console.log(error)
            }
        });

        // Open search input
        document.getElementById('search_note').addEventListener('click', (node) => {
            if (!searchBoolean) {
                document.getElementById('findNote').classList.remove('hidden');
                searchBoolean = true;

                document.getElementById('findNote').focus();

                document.getElementById('findNote').addEventListener('change', (node) => {
                    myFunc.searchNote(node.target.value);
                })
            }
        })
        
        
        // If all values from user load, so remove the loading span
        document.getElementById('wait_server').style.opacity = '0';
        setTimeout(() => document.getElementById('wait_server').style.display = 'none', 1500);
        document.getElementById('container_main').style.display = 'block';
    } catch (error) {
        document.getElementById('wait_server').innerHTML = `Error: ${error}`
    }
})

// DELETE ACCOUNT BUTTON
document.getElementById('delete_forever_svg').addEventListener('click', async () => {
    if (confirm("Do you really want to delete your account?")) {
        console.log("DELETAR");
        const res = await fetch("/notes/delete", {method: 'DELETE'});
        window.location.href = 'http://localhost:8080';
    } else {
        console.log("CANCELAR");
    }
})