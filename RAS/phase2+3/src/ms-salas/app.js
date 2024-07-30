var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');

var app = express();

var mongoose = require('mongoose')
var mongodbURI = process.env.MONGODB_URL || 'mongodb://127.0.0.1/SALAS';
mongoose.connect(mongodbURI /*, {useNewUrlParser: true, useUnifiedTopology: true}*/)
var db = mongoose.connection
db.on('error', console.error.bind(console, "MongoDB conection error.."))
db.on('open', function() {
  console.log("MongoDB: Conexão estabelecida com sucesso...")
})

//* To increase the maximum size of the request body
// app.use(bodyParser.json({ limit: '100mb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/salas/', indexRouter);

module.exports = app;
