let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let helmet = require('helmet');
let mongoose = require('mongoose');
let cors = require('cors');
let autoParse = require('auto-parse');

let app = express();

let port = process.env.PORT || 8080;

app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

//CONNECTING TO DATABASE
mongoose.Promise = global.Promise;
let options = {
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 100,
    poolSize: 10,
    bufferMaxEntries: 0
};
let uri = process.env.MONGODB_URI || 'mongodb://localhost:27015/webone';
mongoose.connect(uri, options);

// REGISTER ROUTES -------------------------------
let users = require('./server/routes/users');
let courts = require('./server/routes/courts');
let events = require('./server/routes/events');

//Check if request is valid and parse numbers represented as string etc
app.use(function (err, req, res, next) {
    if (err) res.status(400).send('Bad request body');
    else next();
});
app.all('/*', function (req, res, next) {
    if (Object.keys(req.body).length !== 0) {
        req.body = autoParse(req.body);
    }
    if (Object.keys(req.query).length !== 0) {
        req.query = autoParse(req.query);
    }
    next();
});

//Log if error
function modifyResponseBody(req, res, next) {
    let oldSend = res.send;

    res.send = function (data) {
        if (typeof autoParse(data) === 'string' && data !== 'OK') {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
            console.log('REQUEST FROM IP ( ' + ip + ' ):');
            if (Object.keys(req.body).length !== 0) {
                console.log(req.body);
            }
            if (Object.keys(req.query).length !== 0) {
                console.log(req.query);
            }
            console.log();
            console.log('RESPONSE:');
            console.log(data);
            console.log();
        }
        res.send = oldSend;
        oldSend.apply(res, arguments);
    };
    next();
}

app.use(modifyResponseBody);

app.use('/api/users', users);
app.use('/api/courts', courts);
app.use('/api/events', events);

// START THE SERVER -------------------------------
app.listen(port);
console.log('Server started on port ' + port);