var mongoose = require('mongoose');
var dbURI = 'mongodb://ammiraglio:mozzo94@64.137.214.77:27017/webData?authSource=admin';

mongoose.Promise = global.Promise;
mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open to ' + dbURI);
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected.');
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose connection disconnected through app termination.');
        process.exit(0);
    });
});

var User = require('./user');
var City = require('./city');

module.exports = {
    User: User,
    City: City
};

//exports.User = User;
//exports.City = City; 