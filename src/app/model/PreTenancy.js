"use strict";
const mongoose = require("mongoose");
const pretenancySchema = new mongoose.Schema(
  {
    zip: {
      type: String,
    },
    how_often: {
      type: String,
    },
    how_cleaned: {
      type: Number,
    },
    specific_rooms: {
      type: [
        {
          name: {
            type: String,
          },
          count: {
            type: String,
          },
        },
      ],
    },
    extra_service: {
      type: String,
    },
    billingAddress: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    clientRef: {
      type: String,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

pretenancySchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("PretenancySchema", pretenancySchema);
