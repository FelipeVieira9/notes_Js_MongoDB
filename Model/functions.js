const { hash, compare } = require('bcrypt');
const { User } = require('./model');
require('dotenv').config({path: '../.env'});

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

const postNote = async (login, title, note, date, iv) => {
    const user = await findOnePerson({login: login});

    user.notes.push({title: title, note: note, date: date, iv: iv});
    await user.save();
}

const ediNote = async (login, title, note, index) => {
    const user = await findOnePerson({login: login});
    const {encrypted_note, encrypted_title, iv} = encrypt(title, note, crypto.randomBytes(16));

    user.notes[index].title = encrypted_title;
    user.notes[index].note = encrypted_note;
    user.notes[index].iv = iv;
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

const crypto = require('crypto');

const encrypt = (title, note, iv) => {
    const alg = process.env.alg;
    // console.log(`Valor enviado: ${text}`);
    // const iv = crypto.randomBytes(16); // Coloco no formato de Buffer com 16 bytes
    const cipher_1 = crypto.createCipheriv(alg, Buffer.from(process.env.encryptSecret), iv); // crio o meu algoritmo
    let encrypted_1 = cipher_1.update(title); // utilizo meu algoritmo para criptografar o valor no text
    encrypted_1 = Buffer.concat([encrypted_1, cipher_1.final()]); // junto oq tá criptografado com o q sobrou no cipher??

    const cipher_2 = crypto.createCipheriv(alg, Buffer.from(process.env.encryptSecret), iv); // crio o meu algoritmo
    let encrypted_2 = cipher_2.update(note); // utilizo meu algoritmo para criptografar o valor no text
    encrypted_2 = Buffer.concat([encrypted_2, cipher_2.final()]); // junto oq tá criptografado com o q sobrou no cipher??



    return {encrypted_title: encrypted_1.toString('hex'), encrypted_note: encrypted_2.toString('hex'), iv: iv}
}

const decrypt = (encrypted, iv) => {
    const alg = process.env.alg;
    const decipher = crypto.createDecipheriv(alg, Buffer.from(process.env.encryptSecret), iv);
    let plainText = decipher.update(encrypted, 'hex', 'utf8'); // falo que vou descriptografar do formato hex para o formato uft8
    plainText += decipher.final('utf8');
    // console.log(`Saiu: ${plainText}`);
    return plainText;
}

module.exports = { createAndSavePerson, hashPassword, findOnePerson, comparePassword, postNote, ediNote, deleteNote, encrypt, decrypt};