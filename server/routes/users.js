let express = require('express');
let crypto = require('crypto');
let router = express.Router();
let multer = require('multer');
let upload = multer({
    dest: 'public/users/'
});
let path = require("path")
let fs = require('fs');
let userModel = require('../models/user.js');

router.route('/')
    .get(function(req, res){
        let query ={};
        if(req.query.email){
            query.email = req.query.email;
        }
        else req.query.trainer = true;
        userModel.find(query, '-_id -__v -password -salt -permision -SID', function (err, users) {
            if(err) res.status(400).send('Error getting users list');
            else res.json(users);
        })
    })
    .post(function (req, res) {
        let email = req.body.email;
        let password = req.body.password;
        let salt = crypto.createHash('sha256').update(email + 'WebOne').digest('hex');
        password = crypto.createHash('sha256').update(password + salt).digest('hex');
        userModel.findOne({'email':email, 'password':password}, '-__v -password -salt -SID', function (err, user) {
            if(user.SID){
                user = JSON.parse(JSON.stringify(user));
                user._id = undefined;
                res.json(user);
            }
            else{
                user.SID = crypto.createHash('sha256').update('Web' + salt + user._id + Date.now()).digest('hex');
                user.save(function (err) {
                    if(err) res.sendStatus(400);
                    else{
                        user = JSON.parse(JSON.stringify(user));
                        user._id = undefined;
                        res.json(user);
                    }
                })
            }
        });
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
        let user = new userModel({email: email, trainer: trainer, password: password, salt: salt, info: info, fullname: fullname, phone: phone});
        user.save(function (err) {
            if(err) res.status(400).send('Cant register you know');
            else res.sendStatus(200);
        })
    });

router.route('/promote')
    .post(function (req, res) {
        let promEmail = req.body.promemail;
        let perm = req.body.permission;
        let SID = req.body.SID;
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
    });

router.route('/top')
    .get(function (req, res) {
        userModel.find().sort('rating').limit(10).select('fullname rating').exec(function (err, result) {
            if(err) res.status(400).send('Error getting top 10 users');
            else res.json(result);
        })
    });

// router.post('/profileImg', upload.single('file'), function (req, res) {
//     let SID = req.body.SID;
//     userModel.findOne({
//         'SID': SID,
//     }, 'permission', function (err, person) {
//         if (err||!person) res.status(400).send('Error while querying database');
//         else if (person) {
//             if (person.permission === 'admin') {
//                 if (req.file) {
//                     userModel.findOne({
//                         fullname: req.file.originalname.split('.')[0].split('_').join(' ')
//                     }, function (err, planet) {
//                         if (err) res.status(400).send('Error while querying planet database');
//                         else if (planet) {
//                             let file = path.join(__dirname, '../../public/profiles', req.file.originalname);
//                             console.log(file);
//                             fs.rename(req.file.path, file, function (err) {
//                                 if (err) {
//                                     res.status(400).send(err);
//                                 } else {
//                                     res.sendStatus(200);
//                                 }
//                             });
//                             console.log(req.protocol + '://' + req.hostname + '/profiles/' + req.file.originalname);
//                         } else res.status(400).send('User with this name not found');
//                     });
//                 } else res.status(400).send('Please send file');
//             } else res.status(400).send('Not enough permission');
//         } else res.status(400).send('User not found');
//     });
// });

module.exports = router;