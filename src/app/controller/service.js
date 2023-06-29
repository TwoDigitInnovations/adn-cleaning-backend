const mongoose = require("mongoose");
const response = require("./../responses");
const Zip = mongoose.model("Zip");
const Booking = mongoose.model("Booking");
const JobInvite = mongoose.model("JobInvite");
const Incident = mongoose.model("Incident");
const userHelper = require("./../helper/user");
const Notification = mongoose.model("Notification");

const fs = require("fs");
const notification = require("../services/notification");

module.exports = {
  serviceAvailable: async (req, res) => {
    try {
      let zipList = [];
      fs.readFile(__dirname + `/data/cities.json`, "utf-8", (err, data) => {
        zipList = JSON.parse(data).cities;

        const zip = zipList.find(
          (f) => f.code.toLowerCase() === req.params["zip"].toLowerCase()
        );
        console.log(zip);
        if (zip) {
          return response.ok(res, { available: true, message: "available" });
        } else {
          return response.ok(res, {
            available: false,
            message: "unavailable",
          });
        }
      });

      // const zip = Zip.findOne({ code: req.params["zip"] }).lean();
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
      fs.readFile(__dirname + `/data/cities.json`, "utf-8", (err, datas) => {
        return response.ok(res, JSON.parse(datas));
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getConfig: async (req, res) => {
    try {
      return response.ok(res, {
        title: [
          // { type: "marriage_security", name: "Marrige Security Guard" },
          { type: "event_security", name: "Event Security" },
          { type: "body_guards", name: "Body Guards" },
          { type: "concierge_receptionist", name: "Concierge/Receptionist" },
          { type: "door_staff", name: "Door Staff" },
          { type: "club_security", name: "Club Security" },
          { type: "canine_dog_handlers", name: "Canine/Dog handlers" },
          { type: "retail_security", name: "Retail Security" },
          { type: "key_holdings", name: "Key Holdings" },
          { type: "carpark_security", name: "Carpark Security" },
          { type: "access_patrol", name: "Access patrol" },
          { type: "empty_property", name: "Empty Property" },
        ],
        jobType: [
          { type: "event", name: "Event type" },
          { type: "job", name: "Job type" },
          { type: "security", name: "Security type" },
          { type: "other", name: "Other type" },
        ],
        incidenceType: [
          { type: "thieft", name: "Thieft" },
          { type: "fight", name: "Fight" },
          { type: "fire", name: "Fire" },
          { type: "damage_to_property", name: "Damage To Property" },
          { type: "others", name: "Others" },
        ],
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
      let invites = await JobInvite.find({
        job: { $in: bookings.map((j) => j._id) },
      })
        .populate("invited", "_id username fullName email")
        .lean();
      let obj = {};
      invites.map((i) => {
        if (obj[i.job]) {
          obj[i.job].push(i);
        } else {
          obj[i.job] = [i];
        }
      });
      bookings.map((j) => {
        j.invites = obj[j._id];
      });
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
    let job = await Booking.findById(payload.id);
    if (!job)
      return response.notFound(res, { message: "Booking does not exist." });
    let set = new Set(job.invited.map((a) => a.toString()));

    try {
      const user = await userHelper.find({ _id: job.booking_for }).lean();

      for (let i = 0; i < payload.invited.length; i++) {
        if (!set.has(payload.invited[i])) {
          const job = await Booking.findByIdAndUpdate(payload.id, {
            $push: { invited: payload.invited[i] },
          });
          let JobIn = await JobInvite.create({
            invited: payload.invited[i],
            job: payload.id,
            by: payload.posted_by,
            start_date: job.slot.start_date,
            end_date: job.slot.end_date,
          });
          notification.push(
            payload.invited[i],
            `You have been invited by ${user.username} for a job.`,
            JobIn._id
          );
          await JobIn.save();
        }
      }

      return response.ok(res, { message: "Cleaner invited successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  userBookingHistory: async (req, res) => {
    try {
      let filter = req.params["filter"];
      let d = new Date();
      let de = new Date();
      let cond = { $lte: de.getTime() };
      if (filter == "1_WEEK") {
        cond = { $gte: d.setDate(d.getDate() - 7), $lt: de.getTime() };
      }
      if (filter == "2_WEEK") {
        cond = { $gte: d.setDate(d.getDate() - 14), $lt: de.getTime() };
      }
      if (filter == "1_MONTH") {
        cond = { $gte: d.setMonth(d.getMonth() - 1), $lt: de.getTime() };
      }
      if (filter == "1_YEAR") {
        cond = { $gte: d.setFullYear(d.getFullYear() - 1), $lt: de.getTime() };
      }
      const jobs = await JobInvite.find({
        invited: req?.user?.id,
      }).populate({
        path: "job",
        match: { "slot.date": cond },
        select: "-fullObj",
      });

      let job = jobs.filter((f) => f.job !== null);
      return response.ok(res, job);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getjobinviteByUser: async (req, res) => {
    const payload = req?.body || {};
    try {
      const sd = new Date();
      const jobs = await JobInvite.find({
        invited: req?.user?.id,
        status: "PENDING",
      }).populate({
        path: "job",
        match: { "slot.start_date": { $gte: sd.getTime() } },
        select: "-fullObj",
      });
      let job = jobs.filter((f) => f?.job !== null && f?.job?.slot?.start_date);

      return response.ok(res, job);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getComFirmJob: async (req, res) => {
    const payload = req?.body || {};
    try {
      const sd = new Date();
      const jobs = await JobInvite.find({
        invited: req?.user?.id,
        status: "ACCEPTED",
      }).populate({
        path: "job",
        match: { "slot.start_date": { $gte: sd.getTime() } },
        select: "-fullObj",
      });
      let job = jobs.filter((f) => f.job !== null && f?.job?.slot?.start_date);
      return response.ok(res, job);
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

      let user = await userHelper.find({ _id: jobs.invited }).lean();

      let msg = `${user.username} has rejected the below job..`;
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
        msg = `${user.username} has accepted the below job..`;
      }
      const noti = await Notification.create({
        for: jobs.by,
        message: msg,
        invited_for: jobs._id,
      });
      console.log(noti);
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

  addIncident: async (req, res) => {
    try {
      const incidentDetails = req.body;
      const incident = new Incident({
        title: incidentDetails.title,
        details: incidentDetails.details,
        job: incidentDetails.job_id,
        posted_by: req.user.id,
      });
      // if (req.files.length) {
      //   const files = req.files;
      //   for (let f = 0; f < files.length; f++) {
      //     await Photo.create({ key: files[f].key, incident_id: incident._id });
      //   }
      // }
      await incident.save();
      return response.ok(res, { message: "Incident Added!" });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getIncidents: async (req, res) => {
    try {
      let incidents = await Incident.find({})
        .populate("posted_by", "username")
        .lean();
      // let ids = incidents.map((i) => i._id);
      // const photos = await Photo.find({ incident_id: { $in: ids } });

      // incidents.map(async (ele) => {
      //   ele.url = process.env.ASSET_ROOT;
      //   ele.photos = photos.filter((f) => {
      //     ele.image = `${process.env.ASSET_ROOT}/${f.key}`;
      //     return f.incident_id.toString() === ele._id.toString();
      //   });
      // });

      return response.ok(res, { incident: incidents });
    } catch (error) {
      return response.error(res, error);
    }
  },
};
