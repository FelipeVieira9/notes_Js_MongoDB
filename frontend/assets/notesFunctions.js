/**
 * @async
 * @returns the user object
 */
export const getUser = async () => {
    try {
        const res = await fetch('http://localhost:8080/notes/user');
        const data = res.json();

        // console.log(data);
        return data
    } catch (error) {
        console.log(`Error inesperado: ${error}`);
    }
}

/**
 * Make a post to create a new note
 * @param {string} title 
 * @param {string} note 
 */
export const createNewNote = async (title, note) => {
    try {
        const mes = new Date().getMonth() + 1;
        const dia = new Date().getDate();
        const ano = new Date().getFullYear();
        const res = await fetch('/notes/addNote', {method: 'PUT', body: JSON.stringify({title: title, note: note, date: `${dia}/${mes}/${ano}`}), headers: {'content-type': 'application/json'} });
        // const data = await res.json();
        console.log(data);
        console.log('sucesso');
    } catch (error) {
        console.log(error);
    }
}

export const editNote = async (title, note, index) => {
    try {
        const res = await fetch('/notes/editNote', {method: 'PUT', body: JSON.stringify({title: title, note: note, index: index}), headers: {'content-type': 'application/json'}});
    } catch (error) {
        console.log(error)
    }
}

/**
 * Put all notes object, inside user.notes array, in the window
 * @param {object} user 
 */
export const sendNotes = (user) => {
    console.log(user);
    if (user.notes.length === 0) {
        // console.log('vazio');
    } else {
        // console.log('nao vazio');
        document.getElementById('welcome_div').style.display = 'none';

        let i = 0;
        user.notes.forEach(({title, note, date}) => {
            let HTML = `
            <article id="note_${i}" class="notes">
                <header>
                    <span class="noteTitle" id="noteTitle_${i}">${title}</span>
                    <span class="noteHeader_container">
                        <div>Create: ${date}</div>
                        <div id="editNote_${i}" class="editNote">
                            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000000">
                                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                            </svg>
                        </div>
                        <div id="deleteNote_${i}" class="deleteNote">
                            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000000">
                                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                            </svg>
                        </div>
                    </span>
                </header>
                <p class="note_text" id="note_text_${i}">
                    ${note}
                </p>
            </article>`;

            document.querySelector('main').insertAdjacentHTML('beforeend', HTML);
            i++;
        })
    }
}

export const deleteNote = async (noteIndex) => {
    const res = await fetch('/notes/deleteNote', {method: 'PUT', body: JSON.stringify({noteIndex: noteIndex}) ,headers: {'content-type': 'application/json'}})
    console.log('cade???')
}

