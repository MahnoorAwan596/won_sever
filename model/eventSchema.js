const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true }) // Timestamps to indicate when the document is created

const Events = mongoose.model("EVENTS", eventSchema);

module.exports = Events;