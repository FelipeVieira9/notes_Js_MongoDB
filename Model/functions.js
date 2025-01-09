const { hash, compare } = require('bcrypt');
const { User } = require('./model');
require('dotenv').config({path: '../.env'});

/**
 * This function take the password and encrypt via Hash (one-way)
 * @param {string} password - The password going to be Hashed
 * @return {Promise} Hashed password
 */
const hashPassword = async (password) => {
    return await hash(password, 8);;
}

/**
 * (POST) -> This function try to make a new person to save on mongoDB
 * @param {string} login
 * @param {string} password
 * @returns {Promise} Return the user object
 */
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
/**
 * Search for the user with login string and return the user
 * @param {string} login 
 * @returns {Promise} The User found in the database
 */
const findOnePerson = async ({login}) => {
    return await User.findOne({login: login}).exec();
}

/**
 * Delete the user
 * @param {string} login
 * @returns {Promise}
 */
const deleteThisPerson = async (login) => {
    return await User.deleteOne({login: login}).exec();
} 

/**
 * (PUT) -> This function put a new note on mongoDB on the user with the same login
 * @param {string} login 
 * @param {string} title 
 * @param {string} note 
 * @param {string} date 
 * @param {string} iv 
 * @returns {Promise}
 */
const postNote = async (login, title, note, date, iv) => {
    const user = await findOnePerson({login: login});

    user.notes.push({title: title, note: note, date: date, iv: iv});
    return await user.save();
}

/**
 * (PUT) -> This function edit the note on the user with the same login 
 * @param {string} login 
 * @param {string} title 
 * @param {string} note 
 * @param {string} index 
 * @returns {Promise}
 */
const ediNote = async (login, title, note, index) => {
    const user = await findOnePerson({login: login});
    const {encrypted_note, encrypted_title, iv} = encrypt(title, note, crypto.randomBytes(16));

    user.notes[index].title = encrypted_title;
    user.notes[index].note = encrypted_note;
    user.notes[index].iv = iv;
    await user.save();
}

/**
 * (PUT) -> This function remove the note using their index
 * @param {string} user 
 * @param {number} index 
 * @returns {Promise}
 */
const deleteNote = async (user, index) => {
    user.notes.splice(index, 1);
    await user.save();
}

/**
 * This function compare the password in the database with the login
 * @param {string} login 
 * @param {string} password 
 * @returns {Promise}
 * @throws Error if login doesn't exist
 * @throws Error if password is wrong
 */
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
const { default: mongoose, Query } = require('mongoose');

/**
 * This function is a two-way encrypt, uses title and note to encrypt
 * using the iv vector and a hidden key in .env
 * @param {string} title 
 * @param {string} note 
 * @param {Buffer} iv 
 * @returns {object}
 */
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

/**
 * Reverse the encrypt
 * @param {string} encrypted 
 * @param {Buffer} iv 
 * @returns {string}
 */
const decrypt = (encrypted, iv) => {
    const alg = process.env.alg;
    const decipher = crypto.createDecipheriv(alg, Buffer.from(process.env.encryptSecret), iv);
    let plainText = decipher.update(encrypted, 'hex', 'utf8'); // falo que vou descriptografar do formato hex para o formato uft8
    plainText += decipher.final('utf8');
    // console.log(`Saiu: ${plainText}`);
    return plainText;
}

module.exports = { createAndSavePerson, hashPassword, findOnePerson, comparePassword, postNote, ediNote, deleteNote, encrypt, decrypt, deleteThisPerson};