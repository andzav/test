let mongoose = require('mongoose');
let autoIncrement = require('../remastered_modules/mongoose-auto-increment.js');
let Schema = mongoose.Schema;

let tournamentSchema = new Schema({
    id: { type: Number, index:true, unique: true },
    caption: {type: String, required: true},
    participants: [],
    courtID: {type: Number, required: true},
    date: { start: {type: Date, required: true}, end: {type: Date, required: true}},
    games_log: [ {player1: String, player2:String, score1:Number, score2:Number} ],
    code: { type: String, default: ''},
    organizer: { type: String}
});

autoIncrement.initialize(mongoose.connection);
tournamentSchema.plugin(autoIncrement.plugin, { model: 'tournament', field: 'id', startAt: 1 });

module.exports = mongoose.model('tournament', tournamentSchema);