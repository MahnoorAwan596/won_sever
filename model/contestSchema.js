const mongoose = require('mongoose');

const Schema = mongoose.Schema

const contestSchema = new Schema({
    contestcreator: {
        type: String,
        required: true
    },
    contesttitle: {
        type: String,
        required: true
    },
    designtype: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    designusedas: {
        type: String,
        required: true
    },
    enddate: {
        type: Date,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    additionaldescription: {
        type: String,
        required: true
    }
}, { timestamps: true }) // Timestamps to indicate when the document is created

module.exports = mongoose.model('Contest', contestSchema)