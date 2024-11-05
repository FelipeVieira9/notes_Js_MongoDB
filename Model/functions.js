const { hash, compare } = require('bcrypt');
const { User } = require('./model');
require('dotenv').config();
// const crypto = require('crypto');

const hashPassword = async (password) => {
    const hashPass = await hash(password, 8);
    return hashPass;
}

const createAndSavePerson = async ({login, password}) => {
    // Minimum eight characters, at least one letter and one number:
    // "^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/

    if(!passwordRegex.test(password)) {
        throw "Password inválido"
    } else if (login.length < 3) {
        throw "Login inválido"
    }
    
    let user = await new User({login: login, password: await hashPassword(password)});
    let loginExist = await User.findOne({login: login}).exec();

    if (loginExist) {
        console.log("Ja existe esse login");
        throw ("Ja existe esse login");
    } else {
        await user.save();
    }

    return user;
}

const findOnePerson = async ({login}) => {
    return await User.findOne({login: login}).exec();
}

const postNote = async (login, title, note, date) => {
    const user = await findOnePerson({login: login});

    user.notes.push({title: title, note: note, date: date});
    await user.save();
}

const ediNote = async (login, title, note, index) => {
    const user = await findOnePerson({login: login});

    user.notes[index].title = title;
    user.notes[index].note = note;
    await user.save();
}

const deleteNote = async (user, index) => {
    user.notes.splice(index, 1);
    await user.save();
}
const comparePassword = async (login, password) => {
    const user = await findOnePerson({login: login});
    if (!user) {
        throw 'Usuário não encontrado!'
    }

    const result = await compare(password, user.password);
    
    if (!result) {
        throw 'Senha incorreta!';
    } 
}

// const encrypt = (password) => {
//     const iv = Buffer.from(crypto.randomBytes(16));
//     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.encryptSecret), iv);
//     let encrypted = cipher.update(password);
//     encrypted = Buffer.concat([encrypted, cipher.final()]);
//     return encrypted.toString('hex')
// }

module.exports = { createAndSavePerson, hashPassword, findOnePerson, comparePassword, postNote, ediNote, deleteNote};