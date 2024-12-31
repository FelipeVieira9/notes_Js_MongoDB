let mongoose = require('mongoose');

let User;
const userSchema = mongoose.Schema({
    login: String,
    password: String,
    notes: [{title: String, note: String, date: String, iv: Buffer}]
})

User = mongoose.model('User', userSchema, 'users'); // <<<<---- 

module.exports = { User }