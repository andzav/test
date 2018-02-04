let express = require('express');
let router = express.Router();
let courtModel = require('../models/court.js');
let userModel = require('../models/user.js');
let courtTypes = ['tennis', 'football', 'basketball', 'badminton', 'stadium', 'volleyball'];

router.route('/')
    .get(function (req, res) {
        let query = {};
        if (req.query.type !== undefined) query.type = req.query.type;
        if (req.query.whs !== undefined) query.working_hours.start = {$gte: req.query.whs};
        if (req.query.whe !== undefined) query.working_hours.end = {$lte: req.query.whe};
        if (req.query.rpf !== undefined && req.query.rpt !== undefined) query.rent_price = {
            $gte: req.query.rpf,
            $lte: req.query.rpt
        };
        if (req.query.x !== undefined && req.query.y !== undefined) {
            query.location.x = {$gte: req.query.x - 0.5, $lte: req.query.x + 0.5};
            query.location.x = {$gte: req.query.y - 0.5, $lte: req.query.y + 0.5};
        }
        if (req.query.region !== undefined) {
            query.region = req.query.region;
        }
        courtModel.find(query, '-_id -__v', function (err, result) {
            if (err) res.status(400).send('Error while finding places: ' + err);
            else res.json(result);
        });
    })
    .post(function (req, res) {
        let info = req.body;
        let SID = req.body.SID;
        userModel.findOne({'SID': SID}, function (err, person) {
            if (err) res.status(400).send('Cant delete court now');
            else {
                if (person !== null && (person.permission === 'admin' || person.permission === 'moderator')) {
                    if (info !== undefined || info.location !== undefined || info.working_hours !== undefined) {
                        if (info.location.x === undefined || info.location.y === undefined) {
                            res.status(400).send("Please specify coordinates");
                        } else if (info.working_hours.start === undefined || info.working_hours.end === undefined || info.working_hours.end <= info.working_hours.start) {
                            res.status(400).send("Bad working hours specified");
                        } else if (info.rent_price === undefined || info.rent_price < 0) {
                            res.status(400).send("Please specify non-negative rent price");
                        } else if (info.region === undefined) {
                            res.status(400).send("Please specify region");
                        } else if (info.num_people === undefined || info.num_people <= 0) {
                            res.status(400).send("Please specify positive number of people");
                        } else if (info.type === undefined || courtTypes.indexOf(info.type) === -1) {
                            res.status(400).send("Please specify right type of place");
                        } else {
                            let court = new courtModel({
                                location: {x: info.location.x, y: info.location.y},
                                type: info.type,
                                region: info.region,
                                info: info.info,
                                preview_url: "https://maps.googleapis.com/maps/api/staticmap?center="+x+","+y+"&zoom=12&size=400x400&markers=color:red|"+x+","+y,
                                working_hours: {start: info.working_hours.start, end: info.working_hours.end},
                                rent_price: info.rent_price,
                                num_people: info.num_people
                            });
                            court.save(function (err) {
                                if (err) res.status(400).send('Error while saving place: ' + err);
                                else res.sendStatus(200);
                            });
                        }
                    } else {
                        res.status(400).send("No location or working hours");
                    }
                } else res.status(400).send('Not enough permission');
            }
        });
    })
    .put(function (req, res) {
        let id = req.body.id;
        let SID = req.body.SID;
        userModel.findOne({'SID': SID}, function (err, person) {
            if (err || !person) res.status(400).send('Cant delete court now');
            else {
                if (person.permission === 'admin' || person.permission === 'moderator') {
                    courtModel.find({'id': id}).limit(1).exec(function (err, court) {
                        if(court.length>0){
                            if (req.body.type) court[0].type = req.body.type;
                            if (req.body.rent_price) court[0].rent_price = req.body.rent_price;
                            if (req.body.num_people) court[0].num_people = req.body.num_people;
                            if (req.body.info) court[0].info = req.body.info;
                            if (req.body.working_hours && req.body.working_hours.start !== undefined && req.body.working_hours.end !== undefined && req.body.working_hours.start < req.body.working_hours.end) {
                                court[0].working_hours.start = req.body.working_hours.start;
                                court[0].working_hours.end = req.body.working_hours.end;
                            }
                            if (req.location && req.location.x !== undefined && req.location.y !== undefined) {
                                court[0].location.x = req.location.x;
                                court[0].location.y = req.location.y;
                            }
                            court.preview_url = "https://maps.googleapis.com/maps/api/staticmap?center="+court[0].x+","+court[0].y+"&zoom=12&size=400x400&markers=color:red|"+court[0].x+","+court[0].y;
                            court[0].save(function (err) {
                                if (err) res.status(400).send("Error updating court info");
                                else res.sendStatus(200);
                            });
                        }
                    });
                } else res.status(400).send('Not enough permission');
            }
        });
    })
    .delete(function (req, res) {
        let id = req.body.id;
        let SID = req.body.SID;
        userModel.findOne({'SID': SID}, function (err, person) {
            if (err || !person) res.status(400).send('Cant delete court now');
            else {
                if (person.permission === 'admin' || person.permission === 'moderator') {
                    if (id && id > 0) {
                        courtModel.findOneAndRemove({'id': id}, function (err) {
                            if (err) res.status(400).send('Error while deleting place: ' + err);
                            else res.sendStatus(200);
                        })
                    }
                } else res.status(400).send('Not enough permission');
            }
        })
    });

module.exports = router;