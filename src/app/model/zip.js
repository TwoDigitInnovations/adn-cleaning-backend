'use strict';
const mongoose = require('mongoose');
const zipSchema = new mongoose.Schema({
    code: {
        type: String
    },
    message: {
        type: String
    },
    available: {
        type: Boolean, default: true
    }
}, {
    timestamps: true
});

zipSchema.set('toJSON', {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Zip', zipSchema);
