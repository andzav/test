let express = require('express');
let router = express.Router();
let courtModel = require('../models/court.js');
let userModel = require('../models/user.js');
// let multer = require('multer');
// let upload = multer({
//     dest: 'public/courts/'
// });
// let path = require("path")
// let fs = require('fs');
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
                        if (req.body.type) court.type = req.body.type;
                        if (req.body.rent_price) court.rent_price = req.body.rent_price;
                        if (req.body.num_people) court.num_people = req.body.num_people;
                        if (req.body.working_hours && req.body.working_hours.start !== undefined && req.body.working_hours.end !== undefined && req.body.working_hours.start < req.body.working_hours.end) {
                            court.working_hours.start = req.body.working_hours.start;
                            court.working_hours.end = req.body.working_hours.end;
                        }
                        if (req.location && req.location.x !== undefined && req.location.y !== undefined) {
                            court.location.x = req.location.x;
                            court.location.y = req.location.y;
                        }
                        court.save(function (err) {
                            if (err) res.status(400).send("Error updating court info");
                            else res.sendStatus(200);
                        });
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

// router.post('/courtImg', upload.single('file'), function (req, res) {
//     console.log(req.files);
//     console.log(req.file);
//     let SID = req.body.SID;
//     userModel.findOne({
//         'SID': 'test',
//     }, 'permission', function (err, person) {
//         if (err) res.status(400).send('Error while querying database');
//         else if (person) {
//             if (person.permission === 'admin') {
//                 if (req.file) {
//                     courtModel.findOne({
//                         id: req.file.originalname.split('.')[0]
//                     }, function (err, court) {
//                         if (err) res.status(400).send('Error while querying court database');
//                         else if (court) {
//                             let file = path.join(__dirname, '../../public/courts', req.file.originalname);
//                             console.log(file);
//                             fs.rename(req.file.path, file, function (err) {
//                                 if (err) {
//                                     console.log(err);
//                                     res.status(400).send(err);
//                                 } else {
//                                     res.sendStatus(200);
//                                 }
//                             });
//                             console.log(req.protocol + '://' + req.hostname + '/courts/' + req.file.originalname);
//                         } else res.status(400).send('Court not found');
//                     });
//                 } else res.status(400).send('Please send file');
//             } else res.status(400).send('Not enough permission');
//         } else res.status(400).send('User not found');
//     });
// });

module.exports = router;