var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var mongoose = require("mongoose");
var mongoDB = process.env.MONGODB_URL || "mongodb://127.0.0.1/probum";
mongoose.connect(mongoDB, /*{ useNewUrlParser: true, useUnifiedTopology: true }*/);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error..."));
db.on("open", function () {
  console.log("Conexão ao MongoDB realizada com sucesso...");
});

// passport config
var User = require("./models/user");
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use("/api/utilizadores", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.jsonp({ error: err });
});

module.exports = app;