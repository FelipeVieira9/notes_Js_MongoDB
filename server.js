require('dotenv').config();
const express = require('express');
const app = express();
let mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { User } = require('./Model/model');
const { createAndSavePerson, hashPassword, findOnePerson, comparePassword, postNote, ediNote, deleteNote} = require('./Model/functions');

mongoose.connect(process.env.MONGO_URI, {dbName: 'noteSite_Users'}); // <<<<---- 

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para tratar formulários
app.use(cookieParser());
app.use('/assets', express.static(__dirname + "/frontend/assets"));

app.get('/', (req, res, next) => {
    res.clearCookie('token');
    res.sendFile(__dirname + "/frontend/index.html");
})

app.post('/trySingIn', (req, res, next) => {
    console.log(req.body)
    const {login} = req.body;
    const {password} = req.body;

    createAndSavePerson({login: login, password: password}).then((user) => {
        console.log('Usuário criado')

        const token = jwt.sign(user.toJSON(), process.env.tokenSecret, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true
        })

        res.redirect('/notes')
    }).catch((e) => {
        console.log(`Usuário não criado, error: ${e}`);

        if (e === "Password inválido" || e === "Login inválido") {
            res.send(`<script>window.location.href = "http://localhost:8080/singUp"; alert("Login ou senha inválida, tente novamente")</script>`);
        } else {
            res.send(`<script>window.location.href = "http://localhost:8080/singUp"; alert("Esse Login já existe")</script>`);
        }
    });
})

app.get('/singUp', (req, res, next) => {
    res.sendFile(__dirname + "/frontend/pages/singUp.html")
})

app.get('/checkLogin', (req, res, next) => {
    res.clearCookie("token");

    const login = req.query.login;
    const password = req.query.password;

    comparePassword(login, password).then(async () => {
        try {
            const user = await findOnePerson({login: login});
            
            const token = jwt.sign(user.toJSON(), process.env.tokenSecret, { expiresIn: '1h' });
            res.cookie('token', token, {
                httpOnly: true
            })

            res.redirect('/notes');
        } catch (error) {
            res.send(`<script>window.location.href = "http://localhost:8080"; alert("Ocorreu um erro inesperado: ${error}")</script>`);   
        }
    }).catch((e) => {
        if (e === 'Senha incorreta!') {
            res.send(`<script>window.location.href = "http://localhost:8080"; alert("Senha incorreta!")</script>`);
        } else if (e === 'Usuário não encontrado!') {
            res.send(`<script>window.location.href = "http://localhost:8080"; alert("Usuário incorreto!")</script>`);
        } else {
            res.send(`<script>window.location.href = "http://localhost:8080"; alert("Error inesperado ${e}")</script>`);
        }
    })
})

app.get('/notes', (req, res, next) => {
    const token = req.cookies.token;

    try {
        const user = jwt.verify(token, process.env.tokenSecret);
        res.sendFile(__dirname + "/frontend/pages/notes/notes.html");
    } catch (error) {
        console.log("acesso negado");
        res.clearCookie("token");
        res.redirect('/');
    }
})

// app.post('/notes/decryptNotes', (req, res, next) => {
//     const token = req.cookies.token;

//     try {
//         const user = jwt.verify(token, process.env.tokenSecret);
//     } catch (error) {
//         res.clearCookie("token");
//         res.redirect('/');
//     }
// })

app.put('/notes/addNote', async (req, res, next) => {
    console.log('Recebido na rota notes/addNote')
    const tokenOld = req.cookies.token;
    const { title, note, date} = req.body; 
    if (title.length === 0 || note.length === 0) {
        res.status(401).redirect('/notes');
        return;
    }

    console.log(req.body)

    console.log(`title: ${title}, note: ${note}`);

    let user;

    // Verificar se o token é valido e remover ele
    try {
        user = jwt.verify(tokenOld, process.env.tokenSecret);
        console.log(user);
    } catch (error) {
        console.log(error);
        res.clearCookie("token");
        res.status(401);
        next();
        return;
    }

    // post note e criar token atualizado
    try {
        await postNote(user.login, title, note, date);
        user = await findOnePerson({login: user.login});
        const token = jwt.sign(user.toJSON(), process.env.tokenSecret, { expiresIn: '1h' });
        res.clearCookie("token");
        res.cookie('token', token, {
            httpOnly: true
        })
        console.log("atualizado token");
        next();
    } catch (error) {
        res.status(401);
    }
})


app.put('/notes/editNote', async (req, res, next) => {
    console.log('Recebido na rota notes/editNote')
    const tokenOld = req.cookies.token;
    const { title, note, index} = req.body; 
    if (title.length === 0 || note.length === 0) {
        res.status(401).redirect('/notes');
        return;
    }

    // console.log(req.body)

    // console.log(`title: ${title}, note: ${note}`);

    let user;

    // Verificar se o token é valido e remover ele
    try {
        user = jwt.verify(tokenOld, process.env.tokenSecret);
        // console.log(user);
    } catch (error) {
        console.log(error);
        res.clearCookie("token");
        res.status(401);
        next();
        return;
    }

    // post note e criar token atualizado
    try {
        await ediNote(user.login, title, note, index);
        user = await findOnePerson({login: user.login});
        const token = jwt.sign(user.toJSON(), process.env.tokenSecret, { expiresIn: '1h' });
        res.clearCookie("token");
        res.cookie('token', token, {
            httpOnly: true
        })
        console.log("atualizado token");
        next();
    } catch (error) {
        res.status(401);
    }
})

app.put('/notes/deleteNote', async (req, res, next) => {
    console.log('Recebido na rota notes/deleteNote')
    const tokenOld = req.cookies.token;
    const { noteIndex } = req.body; 

    let user;

    // Verificar se o token é valido e remover ele
    try {
        user = jwt.verify(tokenOld, process.env.tokenSecret);
    } catch (error) {
        console.log(error);
        res.clearCookie("token");
        res.status(401);
        next();
        return;
    }

    // post note e criar token atualizado
    try {
        // await ediNote(user.login, title, note, index); <<--
        user = await findOnePerson({login: user.login});
        await deleteNote(user, noteIndex);
        const token = jwt.sign(user.toJSON(), process.env.tokenSecret, { expiresIn: '1h' });
        res.clearCookie("token");
        res.cookie('token', token, {
            httpOnly: true
        })
        console.log("atualizado token");
        next();
    } catch (error) {
        res.status(401);
    }
})

app.get('/notes/user', (req, res, next) => {
    const token = req.cookies.token;

    try {
        const user = jwt.verify(token,  process.env.tokenSecret);
        req.user = user;

        res.json(req.user);
    } catch (error) {
        res.clearCookie("token");
        res.redirect('/');
    }
})

app.listen("8080", () => {
    console.log("Server running on port 8080");
})