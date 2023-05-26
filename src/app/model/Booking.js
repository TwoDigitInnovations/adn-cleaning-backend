'use strict';
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    services: {
        type: Array, "default": []
    },
    location: {
        type: String
    },
    slot: {
        date: { type: Date }, time: { type: String }
    },
    card: {
        type: Object, "default": {}
    }
});

bookingSchema.set('toJSON', {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
