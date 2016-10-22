var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); // prima di validator e altri
var validator = require('express-validator');
var session = require('express-session');
var exphbs = require('express-handlebars');
var hbsHelpers = require('./views/helpers');
var routes = require('./routes/index');
var app = express();

var hbs = exphbs.create({
    defaultLayout: 'base',
    extname: '.hbs',
    helpers: hbsHelpers,
    layoutsDir: path.join(__dirname, 'views/')
}); 

app.engine('hbs', hbs.engine);  
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views/'));

app.use(favicon(path.join(__dirname, 'public', 'favicon(cw-black-bg).ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(validator());
// saveUni:false create session only if something added to req.session
// resave:false not force save session when unmodified
app.use(session({ secret: 'Bevo Rocchetta e mi depuro, effetto Rocchetta!', resave: false, saveUninitialized: false }));

app.use('/', function (req, res, next) {
    console.log('%s : requested %s on %s', new Date().toLocaleString(), req.method, req.protocol + '://' + req.get('host') + req.originalUrl);
    next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
