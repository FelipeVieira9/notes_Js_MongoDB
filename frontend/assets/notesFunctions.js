/**
 * This fuction format the text with common formatts, like itallic, before the function formatText start
 * @param {string} str 
 * @returns {string}
 */
const CommonFormatText = (str) => {
    let stop = false;

    while(!stop) {
    let formatedStr;

    if (/\*{2}[\w0-9À-ú\s]+\*{2}/.test(str)) {
            str = str.replace(/\*{2}[\w0-9À-ú\s]+\*{2}/, (removed) => {
                formatedStr = "<strong>" + removed.replace(/^\*{2}|\*{2}$/g, '') + "</strong>";
                return formatedStr; 
            })
            continue;
        } 
        else if (/_{2}[\w0-9À-ú\s]+_{2}/.test(str)) {
            str = str.replace(/_{2}[\w0-9À-ú\s]+_{2}/, (removed) => {
                formatedStr = "<em>" + removed.replace(/^_{2}|_{2}$/g, '') + "</em>";
                return formatedStr; 
            })
            continue;
        }

        stop = true;
    }
    
    return str;
}

/**
 * This function takes a text and format for each new line
 * @param {string} txt the text going to get formatted
 * @returns {string} formatted text 
 */
export const formatText = (txt) => {
    const txtArr = txt.split(/(\n)/g);
    let HTML = '';

    txtArr.forEach((str, i) => {
        // Possivel bug, pode existir algum if q deveria entrar e nao entrou
        str = CommonFormatText(str);

        if (/^(#[^#])/.test(str)) {
            HTML += `<span class="format_h1">${str.replace(/^(#{1})/, '')}</span>`;
        } else if (/(\n)/.test(str)) {
             if (!(/^\*/.test(txtArr[i - 1]) && /^\*/.test(txtArr[i + 1]))) {
                HTML += "<br>"
             }
            
        } else if (/^(#{2}[^#])/.test(str)) {
            HTML += `<span class="format_h2">${str.replace(/^(#{2})/, '')}</span>`;
        } else if (/^(#{3})/.test(str)) {
            HTML += `<span class="format_h3">${str.replace(/^(#{3})/, '')}</span>`;
        } else if (/(\[.+\]\(.+\))/.test(str)) {
            if (/(!\[.+\]\(.+\))/.test(str)) {
            let strClone = str.split(/(!\[.+\]\(.+\))/);

            strClone.forEach((txt, i) => {
                if (/(!\[.+\]\(.+\))/.test(txt)) {
                    let linkTxt;
                    let linkLocalization;

                    strClone[i].replace(/(^!\[.+\])/, (copy) => {
                        linkTxt = copy.replace(/!|\[|\]/g, '');
                        return '';
                    })

                    strClone[i].replace(/(\(.+\)$)/, (copy) => {
                        linkLocalization = copy.replace(/\(|\)/g, '');
                        return '';
                    })
                    linkTxt = `<img src="${linkLocalization}" alt='${linkTxt}' class='user_image'></img>`;
                    strClone[i] = linkTxt;
                } 
            })
            strClone = strClone.join('');
            str = strClone
            }
            if (/(\[.+\]\(.+\))/.test(str)) {
            let strClone = str.split(/(\[.+\]\(.+\))/);

            strClone.forEach((txt, i) => {
                if (/(\[.+\]\(.+\))/.test(txt)) {
                    let linkTxt;
                    let linkLocalization;

                    strClone[i].replace(/(^\[.+\])/, (copy) => {
                        linkTxt = copy.replace(/\[|\]/g, '');
                        return '';
                    })

                    strClone[i].replace(/(\(.+\)$)/, (copy) => {
                        linkLocalization = copy.replace(/\(|\)/g, '');
                        return '';
                    })
                    linkTxt = `<a href="${linkLocalization}" target='_blank'>` + linkTxt + '</a>';
                    strClone[i] = linkTxt;
                } 
            })
            strClone = strClone.join('');
            str = strClone
            } 
            HTML += str;
        } else if (/^\*/.test(str)) {
            let strClone;
            strClone = str.replace(/^\*/, ''); 
            strClone = `<ul class='user_list'><li>${strClone}</li></ul>`;
            HTML += strClone;

        } else if (str.length) {
            HTML += `<span>${str}</span>`;
        }
    })

    return HTML;
}

/**
 * @returns {Promise} the user object
 */
export const getUser = async () => {
    try {
        const res = await fetch('http://localhost:8080/notes/user');
        const data = res.json();

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
    } catch (error) {
        console.log(error);
    }
}

/**
 * Make a put requisition to edit note 
 * @param {string} title 
 * @param {string} note 
 * @param {string} index The position of the note
 * @returns {Promise} 
 */
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
    } else {
        document.getElementById('welcome_div').style.display = 'none';

        let i = 0;
        user.notes.forEach(({title, note, date}) => {
            const formatedNote = formatText(note);
            console.log(formatedNote);
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
                <div class="note_text" id="note_text_${i}">
                    ${formatedNote}
                </div>
            </article>`;

            document.querySelector('main').insertAdjacentHTML('beforeend', HTML);
            i++;
        })
    }
}

/**
 * Make a put requisition to delete the note in the specified index
 * @param {number} noteIndex 
 */
export const deleteNote = async (noteIndex) => {
    const res = await fetch('/notes/deleteNote', {method: 'PUT', body: JSON.stringify({noteIndex: noteIndex}), headers: {'content-type': 'application/json'}})
}

/**
 * This function rearranges the notes to the specified search string name
 * @param {string} str The note title name to search 
 */
export const searchNote = (str) => {
    if (typeof(str) !== "string" || (str.length === 0 && typeof(str) === "string")) {
        return;
    }

    /*
    
    -> 0 Regex Length = 0 Points
    -> 1 Regex Length = 1 Points
    -> 2 Regex Length = 2 Points
    -> ...

    */

    const resultArray = [
    //   {nodes: ?, points}  
    ];
    const regexArrPoints = [
    // {regex: 'a', points: 0}
    ]
    
    let incrementStr = '';

    for (let i of str) {
        incrementStr += i;
        const regex = new RegExp(incrementStr, 'i');
        
        regexArrPoints.push({regex: regex, points: incrementStr.length});
    }

    regexArrPoints.reverse();

    Array.from(document.getElementsByClassName('notes')).forEach((node) => {
        const nodeTitle = node.children[0].children[0];

        let checkRegex = regexArrPoints.find(({regex}) => regex.test(nodeTitle.textContent));

        if (checkRegex === undefined) {
            resultArray.push({node: node, points: 0})
            node.remove();
            return;
        }

        resultArray.push({node: node, points: checkRegex.points});
        node.remove();
    })

    resultArray.sort(({points: aPoint}, {points: bPoint}) => bPoint - aPoint);

    resultArray.forEach(({node}) => {
        document.querySelector('main').insertAdjacentElement('beforeend', node);
    })
} 