"use strict";
const mongoose = require("mongoose");
const newsletter = new mongoose.Schema(
  {
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

newsletter.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Newsletter", newsletter);
