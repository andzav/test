let express = require('express');
let router = express.Router();
let tournamentModel = require('../models/tournament.js');

router.route('/')
    .get(function(req, res){
        let tournament = new tournamentModel();
        tournament = JSON.parse(JSON.stringify(tournament));
        tournament._id = undefined;
        res.json(tournament);
    })
    .post(function (req, res) {
        res.sendStatus(200);
    })
    .put(function (req, res) {
        res.sendStatus(200);
    })
    .delete(function (req, res) {
        res.sendStatus(200);
    });

module.exports = router;