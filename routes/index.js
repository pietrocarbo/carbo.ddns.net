var express = require('express');
var http = require('http');
var router = express.Router();
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var lineReader = require('line-reader');
var URLlocal = 'mongodb://localhost:27017/test';
var URLremote = 'mongodb://ammiraglio:mozzo94@64.137.214.77:27017/webData?authSource=admin';
var APIKEY = 'ab396c8c6739406ccc15fcfb13190288';
var request = require('request');
var db = require('../models/db');

/* Display home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Carbo Web' });
});

/* Display contact page. */
router.get('/contact', function (req, res, next) {
    res.render('contact', { title: 'Carbo Web' });
});

/* Verify contact page. */
router.post('/contact', function (req, res, next) {
    req.checkBody('name', 'Name should not be empty.').notEmpty();
    req.checkBody('email', 'Please enter a valid email.').isEmail();
    req.checkBody('message', 'Message should not be empty.').notEmpty();
    req.checkBody('message', 'Message should not be empty.').notEmpty();
    req.checkBody('human', 'Wrong answer here.').equals('5');
    var errors = req.validationErrors(true);
    if (errors) {
        console.dir(errors);
        res.render('contact', { errors: errors, success: false });
    } else {
        var contactData = '*\t*\t*\nName: ' + req.body.name + '\tEmail: ' + req.body.email + '\n' + req.body.message;
        fs.appendFile('contacts.txt', contactData, function (err) {
            if (err) throw err;
            console.log('Following text added to contact file:\n' + contactData);
        });
        res.render('contact', { errors: errors, success: true });
    }
    return;
});


/* Display weather page. */
router.get('/getCityWeather', function (req, res, next) {
    if (req.query.name != undefined && req.query.name != "") {
        console.log('Città cercata: ' + req.query.name);
        MongoClient.connect(URLremote, function (err, db) {
            if (err) return;

            var collection = db.collection('cities');
            var regexp = '^' + req.query.name + '$';
            collection.findOne({ 'name': { $regex: regexp, $options: 'i' } }, function (err, doc) {
                if (err) return;

                if (!doc) {
                    res.render('forecast', { title: 'Home - CarboWeb', forecast: null });
                } else {
                    console.log('Risultato query db: ' + doc.name + ' -> ' + doc.id);
                    requestWeatherbyID(doc.id, res);
                }
            });
            db.close();
        });
    } else {
        res.render('forecast', { title: 'Home - CarboWeb', forecast: null });

    }

});


router.get('/register', function (req, res, next) {
    res.render('register', { title: 'CarboWeb - Register' });
});

router.post('/register', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    req.checkBody('username', 'Username must be at least 4 characters long.').notEmpty().len(4);
    req.checkBody('password', 'Username must be at least 6 characters long.').notEmpty().len(6);
    req.checkBody('human', 'Wrong answer here.').equals('7');
    var errors = req.validationErrors(true);
    if (errors) {
        console.dir(errors);
        res.render('register', { errors: errors, success: false });
    } else {
        console.log('Registration user: ' + username + ', psw: ' + password);
        var newUser = new db.User({
            username: username,
            password: password
        });

        newUser.save(function (err, savedUsr) {
            if (err) return console.log(err);
            console.log('User added to db.');
            res.render('register', { errors: null , success: true });
        });

    }

   
});

router.get('/login', function (req, res, next) {
    res.render('login', { title: 'CarboWeb - Login' });
});

router.post('/login', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    console.log('Log-in attempted by user: ' + username + ', psw: ' + password);

    db.User.findOne({ username: username }, function (err, userDoc) {
        if (err) return console.log(err);
        userDoc.comparePasswords(password, function (err, isMatch) {
            console.log(arguments);
            if (err) return console.log(err);
            req.session.auth = true;
        });
    });

});

module.exports = router;

// Other functions

function requestWeatherbyID(cityID, res) {
    var url = 'http://api.openweathermap.org/data/2.5/forecast?APPID=' + APIKEY
        + '&id=' + cityID + '&units=metric&lang=en';
    var opt = {
        host: 'api.openweathermap.org',
        path: 'data/2.5/forecast?APPID=' + APIKEY
        + '&id=' + cityID + '&units=metric&lang=it'
    };
    console.log(opt.host + opt.path + '\nAltri dati ' + cityID + ' ' + APIKEY);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Risposta da: " + url);
            var weather = JSON.parse(body).list;
            for (var i in weather)
                console.log(weather[i].weather);
            res.render('forecast', { title: 'Home - CarboWeb', forecast: weather });
        }
    });
    return;
}

function loadCitiesIDfromFile(URLDB, pathToFile) {
    MongoClient.connect(URLDB, function (err, db) {
        if (err) return console.log(err);
        var pathToFile = pathToFile || 'city.list.json';
        var collection = db.collection('cities');
        var cities = [], city = {}; city.coord = {};
        lineReader.eachLine(pathToFile, function (line, last) {
            var split = line.split('"');
            city.id = parseInt(split[2].slice(1).slice(0, -1), 10);
            city.name = split[5];
            city.country = split[9];
            city.coord.lon = parseFloat(split[14].slice(1).slice(0, -1));
            city.coord.lat = parseFloat(split[16].slice(1).slice(0, -4));
            cities.push(city);
            console.log(city + '\nProcessate ' + cities.length + ' citta');
            city = {}; city.coord = {};

            if (last) {
                collection.insertMany(cities, function (err, result) {
                    console.log(err);
                    console.log(result.result.n + ' totali inserite ' + result.ops.length);
                    db.close();
                });
            }
        });
    });
}
