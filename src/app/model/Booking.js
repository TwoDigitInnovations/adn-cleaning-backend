"use strict";
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  service_id: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  services: {
    type: Array,
    default: [],
  },
  location: {
    type: String,
  },
  slot: {
    date: { type: Date },
    time: { type: String },
  },
  card: {
    type: Object,
    default: {},
  },
  booking_for: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  fullObj: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  applicant: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  invited: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

bookingSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
