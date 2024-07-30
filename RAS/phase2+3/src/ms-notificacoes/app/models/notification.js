module.exports = mongoose => {
    return mongoose.model(
        "notification",
        mongoose.Schema({
            receivers: [{
                mec: String,
                read: { type: Boolean, default: false }
            }],
            creationDate: { type: Date, default: Date.now },
            content: String
        })
    );
};