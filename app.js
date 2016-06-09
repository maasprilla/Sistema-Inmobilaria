var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongodb = require('mongodb');
var mongoose = require('mongoose');
var monk = require('monk');

var url = require('url');

var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);

/*Login*/
var passport = require('passport');
var LocalStrategy  = require('passport-local').Strategy;

var database = monk('localhost:27017/administracion');

//Requires passportjs
require('./models/usuario');
require('./models/passport')(passport);


/* To connect mongodb database */

var routes = require('./routes/index');
var users = require('./routes/users');
var panel = require('./routes/panel');
var app = express();

//To connect monk 
app.use(function(req, res, next) {
    req.db = database;
    console.log('connectado a la bd');
    next();
});


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});


//To connect mongodb
mongoose.connect('mongodb://localhost:27017/administracion');

//Solutions fix

app.use(expressSession({
  store: new MongoStore({ url: 'mongodb://localhost:27017/administracion' }),
  secret: 'edinsoncarranzasaldaña',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 360000000000
  }

}));



//Initialize passport module 
app.use(passport.initialize());
app.use(passport.session());


function verificarUsuario(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  else {
    res.redirect('/');
  }
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', routes);
app.use('/users', users); 


app.use('/panel', verificarUsuario, panel);


app.post('/login', passport.authenticate('local', {
  successRedirect: '/panel',
  failureRedirect: '/notfound'
}));





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



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
