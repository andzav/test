let express = require('express');
let router = express.Router();
// let eventModel = require('../models/event.js');
// let userModel = require('../models/user.js');
// let courtModel = require('../models/court.js');

router.route('/')
    .get(function (req, res) {
        {
            res.sendStatus(10000);
        }
    });

module.exports = router;