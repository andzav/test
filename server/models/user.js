let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let permissionList = ['user', 'moderator', 'admin'];

let userSchema = new Schema({
    email: {type: String, lowercase: true, unique: true, required: true},
    fullname: {type: String, required: true},
    password: String,
    phone: {type: String, default: '+380-xx-xxx-xxxx'},
    salt: String,
    permission: {type: String, default: 'user', enum: permissionList, lowercase: true},
    trainer: {type: Boolean, default: false},
    SID: String,
    rating: {type: Number, default: 0.0},
    info: {type: String, default: undefined}
});

module.exports = mongoose.model('user', userSchema);