"use strict";
const mongoose = require("mongoose");
const jobInvites = new mongoose.Schema(
  {
    invited: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    start_date: { type: Date },
    end_date: { type: Date },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isSubmitted: {
      type: Boolean,
      default: false,
    },
    before: {
      type: String,
    },
    after: {
      type: String,
    },
    status: {
      type: String,
      default: "PENDING",
      enum: ["ASSIGNED", "REJECTED", "ACCEPTED", "PENDING"],
    },
    job_status: {
      type: String,
      default: "ACTIVE",
      enum: ["ACTIVE", "REVOKED", "DELETED", "PUBLIC"],
    },
  },
  {
    timestamps: true,
  }
);

jobInvites.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("JobInvite", jobInvites);
