const mongoose = require("mongoose");
const response = require("./../responses");
const Zip = mongoose.model("Zip");
const Booking = mongoose.model("Booking");
const fs = require("fs");

module.exports = {
  serviceAvailable: async (req, res) => {
    try {
      const zip = Zip.findOne({ code: req.params["zip"] }).lean();

      return response.ok(res, { available: true, message: "available" });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getServiceQuestions: async (req, res) => {
    try {
      // const service = req.params["service"];
      const service = "a";
      fs.readFile(__dirname + `/data/${service}.json`, "utf-8", (err, data) => {
        return response.ok(res, { service: JSON.parse(data) });
      });
    } catch (error) {
      return response.error(res, error);
    }
  },
  createBooking: async (req, res) => {
    try {
      const details = req.body;
      details.booking_for = req.user.id;
      const booking = new Booking(details);
      await booking.save();
      return response.ok(res, { message: "Booking created." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getBookings: async (req, res) => {
    try {
      const sd = new Date(req.query["startDate"]);
      const ed = new Date(req.query["endDate"]);
      const bookings = await Booking.find({
        "slot.date": { $gte: sd, $lte: ed },
      })
        .populate("booking_for", "username email")
        .lean();
      return response.ok(res, { bookings });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getBookingById: async (req, res) => {
    try {
      const booking = await Booking.find({ booking_for: req?.user?.id });
      return response.ok(res, { booking });
    } catch (error) {
      return response.error(res, error);
    }
  },
};
