const mongoose = require("mongoose");
const response = require("./../responses");
const Zip = mongoose.model("Zip");
const Booking = mongoose.model("Booking");
const JobInvite = mongoose.model("JobInvite");

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
  getServices: async (req, res) => {
    try {
      fs.readFile(
        __dirname + `/data/allServices.json`,
        "utf-8",
        (err, data) => {
          return response.ok(res, JSON.parse(data));
        }
      );
    } catch (error) {
      return response.error(res, error);
    }
  },

  getCities: async (req, res) => {
    try {
      fs.readFile(__dirname + `/data/cities.json`, "utf-8", (err, data) => {
        return response.ok(res, JSON.parse(data));
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getServiceQuestions: async (req, res) => {
    try {
      const service = req.params["service"];
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
      const book = await Booking.find({
        booking_for: req?.user?.id,
        service_id: details.service_id,
        "slot.date": details?.slot?.date,
        "slot.time": details?.slot?.time,
      });

      if (book.length === 0) {
        details.booking_for = req.user.id;
        const booking = new Booking(details);
        await booking.save();
        return response.ok(res, { message: "Booking created." });
      } else {
        return response.conflict(res, {
          message: "Booking already exists on this slot.",
        });
      }
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
      const sd = new Date();
      const booking = await Booking.find({
        booking_for: req?.user?.id,
        "slot.date": { $gte: sd },
      }).populate("booking_for", "username email");
      return response.ok(res, { booking });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getBookingById: async (req, res) => {
    try {
      const sd = new Date();
      const booking = await Booking.find({
        booking_for: req?.user?.id,
        "slot.date": { $gte: sd },
      }).populate("booking_for", "username email");
      return response.ok(res, { booking });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getBookingHistory: async (req, res) => {
    try {
      const sd = new Date();
      const booking = await Booking.find({
        booking_for: req?.user?.id,
        "slot.date": { $lte: sd },
      }).populate("booking_for", "username email");
      return response.ok(res, { booking });
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateBooking: async (req, res) => {
    const payload = req?.body || {};
    try {
      await Booking.findByIdAndUpdate(payload.id, payload);
      return response.ok(res, { message: "Booking updated successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  jobinvite: async (req, res) => {
    const payload = req?.body || {};
    try {
      await Booking.findByIdAndUpdate(payload.id, { invited: payload.invited });
      for (let i = 0; i < payload.invited.length; i++) {
        let JobIn = await JobInvite.create({
          invited: payload.invited[i],
          job: payload.id,
          by: payload.posted_by,
        });
        // notification.push(
        //   {
        //     to: jobDetails.staff[i],
        //     from: job.posted_by,
        //     content: `You have been invited by ${user.username} for a job.`,
        //   },
        //   JobIn._id
        // );
        await JobIn.save();
      }

      return response.ok(res, { message: "Cleaner invited successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  userBookingHistory: async (req, res) => {
    try {
      const sd = new Date();
      const bookings = await Booking.find({
        $or: [
          { applicant: { $in: [req?.user?.id] } },
          { invited: { $in: [req?.user?.id] } },
        ],
        "slot.date": { $lte: sd },
      }).populate("applicant invited", "_id username email");
      return response.ok(res, bookings);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getjobinviteByUser: async (req, res) => {
    const payload = req?.body || {};
    try {
      const sd = new Date();
      const bookings = await Booking.find({
        "slot.start_date": { $gte: sd },
        invited: { $in: [req?.user?.id] },
      });
      const jobs = await JobInvite.find({
        invited: req?.user?.id,
        status: "PENDING",
      }).populate("job");
      const invitedJobs = [];
      bookings.forEach((item) => {
        jobs.forEach((ele) => {
          ele.job = item;
          if (item._id.toString() === ele.job._id.toString()) {
            invitedJobs.push(ele);
          }
        });
      });
      return response.ok(res, invitedJobs);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getComFirmJob: async (req, res) => {
    const payload = req?.body || {};
    try {
      const sd = new Date();
      const bookings = await Booking.find({
        applicant: { $in: [req?.user?.id] },
        "slot.start_date": { $gte: sd },
      }).populate("applicant", "_id username email");
      const jobs = await JobInvite.find({
        invited: req?.user?.id,
        status: "ACCEPTED",
      })
        .populate("job")
        .populate("job.applicant");
      const invitedJobs = [];
      bookings.forEach((item) => {
        jobs.forEach((ele) => {
          ele.job = item;
          if (item._id.toString() === ele.job._id.toString()) {
            invitedJobs.push(ele);
          }
        });
      });
      return response.ok(res, invitedJobs);
    } catch (error) {
      return response.error(res, error);
    }
  },

  jobAcceptReject: async (req, res) => {
    const payload = req?.body || {};
    try {
      const jobs = await JobInvite.findByIdAndUpdate(
        payload?.id,
        {
          status: payload.status,
        },
        {
          new: true,
          upsert: true,
        }
      ).populate("job");
      let message = "Job Rejected!!";
      if (payload.status === "ACCEPTED") {
        await Booking.findByIdAndUpdate(
          jobs?.job?._id,
          { applicant: [...jobs?.job.applicant, req.user.id] },
          {
            new: true,
            upsert: true,
          }
        );
        message = "Job Accepted!!";
      }

      return response.ok(res, { message });
    } catch (error) {
      return response.error(res, error);
    }
  },

  rejectBooking: async (req, res) => {
    try {
      await Booking.findByIdAndUpdate(req?.body?.id, {
        active: false,
      });
      return response.ok(res, { message: "Booking rejected successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },
};
