'use strict';
const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
    name: {
        type: String
    },
    questions: {
        type: String
    },
}, {
    timestamps: true
});

serviceSchema.set('toJSON', {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Service', serviceSchema);
