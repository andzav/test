let mongoose = require('mongoose');
let autoIncrement = require('../remastered_modules/mongoose-auto-increment.js');
let Schema = mongoose.Schema;

let eventSchema = new Schema({
    id: {type: Number, index: true, unique: true},
    participants: [{player: String, team: Boolean, host: {type: Boolean, default: false}}],
    code: {type: String, default: ''},
    court: {type: Object, required: true},
    date: {start: {type: Date, required: true}, end: {type: Date, required: true}},
    entry_fee: {type: Number, default: 0.0},
    result: {team1: Number, team2: Number}
});

autoIncrement.initialize(mongoose.connection);
eventSchema.plugin(autoIncrement.plugin, {model: 'event', field: 'id', startAt: 1});

module.exports = mongoose.model('event', eventSchema);