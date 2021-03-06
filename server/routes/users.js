let express = require('express');
let crypto = require('crypto');
let router = express.Router();
let validator = require("email-validator");
let userModel = require('../models/user.js');
let permissionList = ['user', 'moderator', 'admin'];

router.route('/')
    .get(function (req, res) {
        let query = {};
        if (req.query.email) {
            query.email = req.query.email;
        }
        else req.query.trainer = true;
        userModel.find(query, '-_id -__v -password -salt -permission -SID', function (err, users) {
            if (err) res.status(400).send('Error getting users list');
            else res.json(users);
        })
    })
    .post(function (req, res) {
        let email = req.body.email;
        let password = req.body.password;
        let salt = crypto.createHash('sha256').update(email + 'WebOne').digest('hex');
        password = crypto.createHash('sha256').update(password + salt).digest('hex');
        if (validator.validate(email)) {
            userModel.findOne({
                'email': email,
                'password': password
            }, '-__v -password -salt -SID', function (err, user) {
                if (user.SID) {
                    user = JSON.parse(JSON.stringify(user));
                    user._id = undefined;
                    res.json(user);
                }
                else {
                    user.SID = crypto.createHash('sha256').update('Web' + salt + user._id + Date.now()).digest('hex');
                    user.save(function (err) {
                        if (err) res.sendStatus(400);
                        else {
                            user = JSON.parse(JSON.stringify(user));
                            user._id = undefined;
                            res.json(user);
                        }
                    })
                }
            });
        } else {
            res.status(400).send('Bad email');
        }
    });

router.route('/register')
    .post(function (req, res) {
        let email = req.body.email;
        let password = req.body.password;
        let info = req.body.info;
        let fullname = req.body.fullname;
        let trainer = req.body.trainer;
        let phone = req.body.phone;
        let salt = crypto.createHash('sha256').update(email + 'WebOne').digest('hex');
        password = crypto.createHash('sha256').update(password + salt).digest('hex');
        if (validator.validate(email)) {
            let user = new userModel({
                email: email,
                trainer: trainer,
                password: password,
                salt: salt,
                info: info,
                fullname: fullname,
                phone: phone
            });
            user.save(function (err) {
                if (err) res.status(400).send('Cant register you know');
                else res.sendStatus(200);
            })
        } else {
            res.status(400).send('Bad email');
        }
    });

router.route('/promote')
    .post(function (req, res) {
        let promEmail = req.body.promemail;
        let perm = req.body.permission;
        let SID = req.body.SID;
        if (validator.validate(promEmail) && permissionList.indexOf(perm) !== -1) {
            userModel.findOne({'SID': SID}, function (err, person) {
                if (err) res.status(400).send('Cant delete court now');
                else {
                    if (person.permission === 'admin') {
                        userModel.findOne({'email': promEmail}, function (err, user) {
                            user.permission = perm;
                            user.save(function (err) {
                                if (err) res.sendStatus(400);
                                else res.sendStatus(200);
                            });
                        });
                    } else res.status(400).send('Not enough permission');
                }
            });
        } else {
            res.status(400).send('Bad email or permission');
        }
    });

router.route('/top')
    .get(function (req, res) {
        userModel.find().sort('rating').limit(10).select('fullname rating').exec(function (err, result) {
            if (err) res.status(400).send('Error getting top 10 users');
            else res.json(result);
        })
    });

module.exports = router;