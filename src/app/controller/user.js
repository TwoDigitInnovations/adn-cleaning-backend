"use strict";
const userHelper = require("./../helper/user");
const response = require("./../responses");
const passport = require("passport");
const jwtService = require("./../services/jwtService");
const mailNotification = require("./../services/mailNotification");
const mongoose = require("mongoose");

const User = mongoose.model("User");
const Device = mongoose.model("Device");
const Verification = mongoose.model("Verification");
const Notification = mongoose.model("Notification");
const Getintouch = mongoose.model("Getintouch");
const Newsletter = mongoose.model("Newsletter");

module.exports = {
  // login controller
  login: (req, res) => {
    passport.authenticate("local", async (err, user, info) => {
      if (err) {
        return response.error(res, err);
      }
      if (!user) {
        return response.unAuthorize(res, info);
      }
      //console.log('user=======>>',user);
      await Device.updateOne(
        { device_token: req.body.device_token },
        { $set: { player_id: req.body.player_id, user: user._id } },
        { upsert: true }
      );
      let token = await new jwtService().createJwtToken({
        id: user._id,
        user: user.username,
        type: user.type,
      });

      return response.ok(res, {
        token,
        username: user.username,
        type: user.type,
        email: user.email,
        id: user._id,
        isOrganization: user.isOrganization,
        profile: user.profile,
        fullName: user.fullName,
      });
    })(req, res);
  },
  signUp: async (req, res) => {
    try {
      const payload = req.body;
      let user = await User.find({
        $or: [
          { username: payload.username.toLowerCase() },
          { email: payload.email.toLowerCase() },
        ],
      }).lean();
      if (!user.length) {
        // let user = await User.findOne({ email: payload.email.toLowerCase()  }).lean();
        // if (!user) {
        let user = new User({
          username: payload.username.toLowerCase(),
          password: payload.password,
          type: payload.type,
          email: payload.email.toLowerCase(),
          fullName: payload.fullName,
        });
        user.password = user.encryptPassword(req.body.password);
        await user.save();
        mailNotification.welcomeMail({
          email: user.email,
          username: user.username,
        });
        // let token = await new jwtService().createJwtToken({ id: user._id, email: user.username });
        return response.created(res, { username: user.username });
      } else {
        return response.conflict(res, {
          message: "username or email already exists.",
        });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },

  createGetInTouch: async (req, res) => {
    try {
      const payload = req?.body || {};
      let getintouch = new Getintouch(payload);
      const blg = await getintouch.save();
      return response.ok(res, blg);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getGetInTouch: async (req, res) => {
    try {
      let blog = await Getintouch.find();
      return response.ok(res, blog);
    } catch (error) {
      return response.error(res, error);
    }
  },

  changePasswordProfile: async (req, res) => {
    try {
      let user = await User.findById(req.user.id);
      if (!user) {
        return response.notFound(res, { message: "User doesn't exists." });
      }
      user.password = user.encryptPassword(req.body.password);
      await user.save();
      mailNotification.passwordChange({ email: user.email });
      return response.ok(res, { message: "Password changed." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  me: async (req, res) => {
    try {
      let user = await userHelper.find({ _id: req.user.id }).lean();
      return response.ok(res, user);
    } catch (error) {
      return response.error(res, error);
    }
  },
  updateUser: async (req, res) => {
    try {
      delete req.body.password;
      // if (req.body.location) {
      //   req.body.location = {
      //     type: "Point",
      //     // [longitude, latitude]
      //     coordinates: req.body.location,
      //   };
      // }
      const id = req.body.gaurd_id || req.user.id;
      await User.updateOne({ _id: id }, req.body);
      return response.ok(res, { message: "Profile Updated." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  sendOTP: async (req, res) => {
    try {
      const email = req.body.email;
      if (!email) {
        return response.badReq(res, { message: "Email required." });
      }
      const user = await User.findOne({ email });
      if (user) {
        let ver = await Verification.findOne({ user: user._id });
        // OTP is fixed for Now: 0000
        let ran_otp = Math.floor(1000 + Math.random() * 9000);
        await mailNotification.sendOTPmail({
          code: ran_otp,
          email: user.email,
        });
        // let ran_otp = '0000';
        if (
          !ver ||
          new Date().getTime() > new Date(ver.expiration_at).getTime()
        ) {
          ver = new Verification({
            user: user._id,
            otp: ran_otp,
            expiration_at: userHelper.getDatewithAddedMinutes(5),
          });
          await ver.save();
        }
        let token = await userHelper.encode(ver._id);

        return response.ok(res, { message: "OTP sent.", token });
      } else {
        return response.notFound(res, { message: "User does not exists." });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },
  verifyOTP: async (req, res) => {
    try {
      const otp = req.body.otp;
      const token = req.body.token;
      if (!(otp && token)) {
        return response.badReq(res, { message: "otp and token required." });
      }
      let verId = await userHelper.decode(token);
      let ver = await Verification.findById(verId);
      if (
        otp == ver.otp &&
        !ver.verified &&
        new Date().getTime() < new Date(ver.expiration_at).getTime()
      ) {
        let token = await userHelper.encode(
          ver._id + ":" + userHelper.getDatewithAddedMinutes(5).getTime()
        );
        ver.verified = true;
        await ver.save();
        return response.ok(res, { message: "OTP verified", token });
      } else {
        return response.notFound(res, { message: "Invalid OTP" });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },
  changePassword: async (req, res) => {
    try {
      const token = req.body.token;
      const password = req.body.password;
      const data = await userHelper.decode(token);
      const [verID, date] = data.split(":");
      if (new Date().getTime() > new Date(date).getTime()) {
        return response.forbidden(res, { message: "Session expired." });
      }
      let otp = await Verification.findById(verID);
      if (!otp.verified) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      let user = await User.findById(otp.user);
      if (!user) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      await otp.remove();
      user.password = user.encryptPassword(password);
      await user.save();
      mailNotification.passwordChange({ email: user.email });
      return response.ok(res, { message: "Password changed! Login now." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  notification: async (req, res) => {
    try {
      let notifications = await Notification.find({
        for: req.user.id,
        deleted: { $ne: true },
      })
        .populate({
          path: "invited_for",
          populate: { path: "job" },
        })
        .sort({ updatedAt: -1 })
        .lean();
      return response.ok(res, { notifications });
    } catch (error) {
      return response.error(res, error);
    }
  },
  deleteNotification: async (req, res) => {
    try {
      let notification_id = req.params["not_id"];
      await Notification.updateMany(
        notification_id
          ? { for: req.user.id, _id: notification_id }
          : { for: req.user.id },
        { deleted: true }
      );
      return response.ok(res, { message: "Notification(s) deleted!" });
    } catch (error) {
      return response.error(res, error);
    }
  },
  updateSettings: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user.id, { $set: req.body });
      return response.ok(res, { message: "Settings updated." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getSettings: async (req, res) => {
    try {
      const settings = await User.findById(req.user.id, {
        notification: 1,
        distance: 1,
      });
      return response.ok(res, { settings });
    } catch (error) {
      return response.error(res, error);
    }
  },
  fileUpload: async (req, res) => {
    try {
      const userId = req.body.gaurd_id || req.user.id;
      let key = req.file && req.file.key,
        type = req.body.type;
      let ident = await Identity.findOne({ type, user: userId });
      if (!ident) {
        ident = new Identity({ key, type, user: userId });
      }
      if (key) {
        ident.key = key; //update file location
      }
      if (req.body.expire && type == "SI_BATCH") {
        ident.expire = req.body.expire;
      }
      await ident.save();
      return response.ok(res, {
        message: "File uploaded.",
        file: `${process.env.ASSET_ROOT}/${key}`,
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  addNewsLetter: async (req, res) => {
    try {
      const payload = req?.body || {};
      const u = await Newsletter.find(payload);
      if (u.length > 0) {
        return response.conflict(res, {
          message: "Email already exists.",
        });
      } else {
        let news = new Newsletter(payload);
        const newsl = await news.save();
        return response.ok(res, newsl);
      }
    } catch (error) {
      return response.error(res, error);
    }
  },

  getNewsLetter: async (req, res) => {
    try {
      let news = await Newsletter.find();
      return response.ok(res, news);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getCleaners: async (req, res) => {
    try {
      let u = await User.find({ type: "CLEANER" });
      return response.ok(res, u);
    } catch (error) {
      return response.error(res, error);
    }
  },

  notification: async (req, res) => {
    try {
      let notifications = await Notification.find({
        for: req.user.id,
        deleted: { $ne: true },
      })
        .populate({
          path: "invited_for",
          populate: { path: "job", select: "-fullObj" },
        })
        .sort({ updatedAt: -1 })
        .lean();
      return response.ok(res, { notifications });
    } catch (error) {
      return response.error(res, error);
    }
  },
  deleteNotification: async (req, res) => {
    try {
      let notification_id = req.params["not_id"];
      await Notification.updateMany(
        notification_id
          ? { for: req.user.id, _id: notification_id }
          : { for: req.user.id },
        { deleted: true }
      );
      return response.ok(res, { message: "Notification(s) deleted!" });
    } catch (error) {
      return response.error(res, error);
    }
  },
};
