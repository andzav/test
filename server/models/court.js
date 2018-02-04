let mongoose = require('mongoose');
let autoIncrement = require('../remastered_modules/mongoose-auto-increment.js');
let Schema = mongoose.Schema;

let courtTypes = ['tennis', 'football', 'basketball', 'badminton', 'stadium', 'volleyball'];

let courtSchema = new Schema({
    id: {type: Number, index: true, unique: true},
    location: {x: {type: Number, default: 0.0}, y: {type: Number, default: 0.0}},
    region: String,
    type: {type: String, default: 'tennis', enum: courtTypes},
    working_hours: {start: Number, end: Number},
    rent_price: {type: Number, default: 0.0},
    num_people: {type: Number, default: 1}
});

autoIncrement.initialize(mongoose.connection);
courtSchema.plugin(autoIncrement.plugin, {model: 'court', field: 'id', startAt: 1});

module.exports = mongoose.model('court', courtSchema);