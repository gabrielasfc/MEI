var mongoose = require('mongoose');

var emailSchema = new mongoose.Schema({
    receiverList: [{
        name: String,
        email: String
    }],
    email: {
        subject: String,
        body: String
        }
});

module.exports = new mongoose.model('email', emailSchema);