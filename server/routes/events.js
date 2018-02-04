let express = require('express');
let nodemailer = require('nodemailer');
let validator = require("email-validator");
let router = express.Router();
let eventModel = require('../models/event.js');
let userModel = require('../models/user.js');
let courtModel = require('../models/court.js');

let smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.service_email,
        pass: process.env.service_password
    }
});

router.route('/')
    .get(function (req, res) {
        let today = new Date();
        let query = req.query.sh === 'all' ? {} : {'date.start': {$gte: today}};
        if (req.query.code) query.code = req.query.code;
        else req.query.code = '';

        if (req.query.email) query.participants.player = email;

        if (req.query.region) query.court.region = req.query.region;

        if (req.query.type !== undefined) query.court.type = req.query.type;
        if (req.query.ds !== undefined) query.date.start = {$gte: req.query.ds};
        if (req.query.de !== undefined) query.date.end = {$lte: req.query.de};
        if (req.query.rpf !== undefined && req.query.rpt !== undefined) query.entry_fee = {
            $gte: req.query.rpf,
            $lte: req.query.rpt
        };
        if (req.query.x !== undefined && req.query.y !== undefined) {
            query.court.location.x = {$gte: req.query.x - 0.5, $lte: req.query.x + 0.5};
            query.court.location.y = {$gte: req.query.y - 0.5, $lte: req.query.y + 0.5};
        }
        eventModel.find(query, '-_id -__v', function (err, result) {
            if (err) res.status(400).send('Error while finding events: ' + err);
            else res.json(result);
        });
    })
    .post(function (req, res) {
        let info = req.body;
        let SID = req.body.SID;
        userModel.findOne({'SID': SID}, function (err, person) {
            if (err || !person) res.status(400).send('Cant get person account now');
            else {
                if (info !== undefined || info.date !== undefined) {
                    if (info.courtID !== undefined && info.courtID > 0) {
                        courtModel.find({'id': info.courtID}).limit(1).exec(function (err, result) {
                            if (result.length > 0) {
                                if (info.participants !== undefined && info.participants.length > 0) {
                                    if (info.entry_fee !== undefined && info.entry_fee < 0) {
                                        res.status(400).send("Please specify positive entry fee");
                                    } else {
                                        let event = new eventModel();
                                        event.court = result[0];
                                        if (info.code !== undefined && info.code.length > 0) event.code = info.code;
                                        event.entry_fee = info.entry_fee;
                                        let dStart = new Date(info.date.start);
                                        let dEnd = new Date(info.date.end);
                                        eventModel.count({
                                            $or: [
                                                {'date.start': {$gte: dStart, $lte: dEnd}},
                                                {'date.end': {$gte: dStart, $lte: dEnd}},
                                                {$and: [{'date.start': {$lte: dStart}}, {'date.end': {$gte: dEnd}}]}
                                            ]
                                        }, function (err, count) {
                                            if (count === 0) {
                                                if (dStart.getHours() < event.court.working_hours.start || dEnd.getHours() > event.court.working_hours.end) {
                                                    res.status(400).send('Court is closed in selected hours. Please reselect them');
                                                } else {
                                                    event.date.start = dStart;
                                                    event.date.end = dEnd;
                                                    info.participants.unshift(person.email);
                                                    if (info.participants.length > result[0].num_people) {
                                                        let participants = info.participants.slice(0, result[0].num_people);
                                                        event.entry_fee += event.court.rent_price / (participants.length > 0 ? participants.length : 1);
                                                        event.participants = participants.map(function (el, index) {
                                                            if (validator.validate(el)) {
                                                                let mailOptions = {
                                                                    from: process.env.service_email,
                                                                    to: el,
                                                                    subject: 'You have been invited to event on passion.com',
                                                                    text: 'You have been invited to event hosted by ' + person.email +
                                                                        ( event.code.length>0 ? 'Code to find event is '+event.code : 'Feel free to visit')
                                                                };

                                                                smtpTransport.sendMail(mailOptions, (err) => {
                                                                    if (err) console.log(err);
                                                                });
                                                            }

                                                            let teamN = index % 2 === 0;
                                                            let hostS = index === 0;
                                                            return {player: el, team: teamN, host: hostS};
                                                        });
                                                        event.save(function (err) {
                                                            if (err) res.status(400).send("Error while saving");
                                                            else res.status(200).send("Some people were removed due to place limitations");
                                                        });
                                                    } else {
                                                        event.entry_fee += event.court.rent_price / (info.participants.length > 0 ? info.participants.length : 1);
                                                        event.participants = info.participants.map(function (el, index) {
                                                            if (validator.validate(el)) {
                                                                let mailOptions = {
                                                                    from: process.env.service_email,
                                                                    to: el,
                                                                    subject: 'You have been invited to event on passion.com',
                                                                    text: 'You have been invited to event hosted by ' + person.email +
                                                                    ( event.code.length>0 ? 'Code to find event is '+event.code : 'Feel free to visit')
                                                                };

                                                                smtpTransport.sendMail(mailOptions, (err) => {
                                                                    if (err) console.log(err);
                                                                });
                                                            }
                                                            let teamN = index % 2 === 0;
                                                            let hostS = index === 0;
                                                            return {player: el, team: teamN, host: hostS};
                                                        });
                                                        event.save(function (err) {
                                                            if (err) {
                                                                res.status(400).send("Error while saving");
                                                                console.log(err);
                                                            }
                                                            else res.sendStatus(200);
                                                        });
                                                    }
                                                }
                                            } else {
                                                res.status(400).send("Sorry, this dates are already taken")
                                            }
                                        });
                                    }
                                }
                                else res.status(400).send("Please enter participants");
                            } else {
                                res.status(400).send('Cant find court with that id');
                            }
                        });
                    }
                } else {
                    res.status(400).send("No date specified");
                }
            }
        });
    });

router.route('/join')
    .post(function (req, res) {
        let eventID = req.body.eventID;
        let SID = req.body.SID;
        userModel.findOne({'SID': SID}, function (err, person) {
            if (err || !person) res.status(400).send('Cant get person account now');
            else {
                let email = person.email;
                let code = req.body.code ? req.body.code : "";
                eventModel.find({'id': eventID, 'code': code, 'result': undefined}, "", function (err, result) {
                    if (err || result.length < 1) res.status(400).send("Cant find specified event to join");
                    else {
                        if (result[0].participants.length < result[0].court.num_people) {
                            let index = result[0].participants.findIndex(x => x.player === email);
                            if (index === -1) {
                                let teamN = result[0].participants.length % 2 === 0;
                                result[0].participants.push({'player': email, 'team': teamN, 'host': false});
                                result[0].entry_fee = result[0].entry_fee * (result[0].participants.length > 1 ? result[0].participants.length - 1 : 1) / result[0].participants.length;
                                result[0].save(function (err) {
                                    if (err) res.status(400).send('Cant save you to event');
                                    else res.sendStatus(200);
                                })
                            }
                        } else {
                            res.status(400).send("Event is already full");
                        }
                    }
                })
            }
        });
    });

router.route('/submitResult')
    .post(function (req, res) {
        let id = req.body.eventID;
        let SID = req.body.SID;
        userModel.findOne({'SID': SID}, function (err, person) {
            if (err || !person) res.status(400).send('Cant get person account now');
            else {
                let email = person.email;
                eventModel.find({
                    'id': id,
                    'participants.0.player': email,
                    'result': undefined
                }).limit(1).exec(function (err, event) {
                    if (err || event.length !== 1) res.status(400).send('Cant find that event');
                    else {
                        event[0].result.team1 = req.body.score1 ? req.body.score1 : 0;
                        event[0].result.team2 = req.body.score2 ? req.body.score2 : 0;
                        if (req.body.score1 > req.body.score2) {
                            let mailArr = event[0].participants.map(function (el) {
                                return el.player;
                            });
                            userModel.find({'email': {$in: mailArr}}, function (err, result) {
                                if (err || result.length < 1){
                                    console.log(err);
                                    res.status(400).send('Cant update ratings now');
                                }
                                else {
                                    result.forEach(function (el) {
                                        el.rating++;
                                        el.save();
                                    });
                                    event[0].save(function (err) {
                                        if (err) res.status(400).send("Cant save score");
                                        else res.sendStatus(200);
                                    });
                                }
                            })
                        } else if (req.body.score1 < req.body.score2) {
                            let mailArr = event[0].participants.map(function (el) {
                                return el.player;
                            });
                            userModel.find({'email': {$in: mailArr}}, function (err, result) {
                                if (err || result.length < 1){
                                    console.log(err);
                                    res.status(400).send('Cant update ratings now');
                                }
                                else {
                                    result.forEach(function (el) {
                                        el.rating++;
                                        el.save();
                                    });
                                    event[0].save(function (err) {
                                        if (err) res.status(400).send("Cant save score");
                                        else res.sendStatus(200);
                                    });
                                }
                            })
                        }
                    }
                });
            }
        });
    });

module.exports = router;