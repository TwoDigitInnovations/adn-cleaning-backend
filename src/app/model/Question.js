'use strict';
const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    name: {
        type: String
    },
    type: {
        type: String
    },
    options: {
        type: String
    }
}, {
    timestamps: true
});

questionSchema.set('toJSON', {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Question', questionSchema);
