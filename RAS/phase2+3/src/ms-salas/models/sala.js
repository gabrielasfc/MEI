const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

var salaSchema = new mongoose.Schema({
    _id: ObjectId,
    building: String,
    floor: Number,
    room: String,
    capacity: Number,
    allocations: [{
        startTime: Date,
        endTime: Date,
    }],
}, { collection: 'salas' });

module.exports = mongoose.model('sala', salaSchema)