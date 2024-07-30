const mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    _id: String,
    name: String,
    email: String,
    type: Number
  });

  userSchema.plugin(passportLocalMongoose, { usernameField: '_id' })

module.exports = mongoose.model('user', userSchema)