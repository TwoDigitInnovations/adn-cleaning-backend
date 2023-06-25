"use strict";
const router = require("express").Router();
const user = require("../../app/controller/user");
const blog = require("../../app/controller/blogs");
const service = require("../../app/controller/service");

const isAuthenticated = require("./../../middlewares/isAuthenticated");

// auth routes
router.post("/login", user.login);
router.post("/signUp", user.signUp);

router.post("/login", user.login);
router.post("/sendOTP", user.sendOTP);
router.post("/verifyOTP", user.verifyOTP);
router.post("/changePassword", user.changePassword);

router.get("/profile", isAuthenticated(["USER", "ADMIN", "CLEANER"]), user.me);
router.post(
  "/updateprofile",
  isAuthenticated(["USER", "ADMIN"]),
  user.updateUser
);

router.post("/getInTouch", user.createGetInTouch);
router.get("/get-getInTouch", user.getGetInTouch);

router.get("/get-cleaners", user.getCleaners);

//blogs
router.get("/getblogcategory", blog.getBloggCategory);
router.post(
  "/create-blog",
  isAuthenticated(["USER", "ADMIN"]),
  blog.createBlog
);
router.get("/get-blog", blog.getBlog);
router.post(
  "/update-blog",
  isAuthenticated(["USER", "ADMIN"]),
  blog.updateBlog
);
router.post("/getBlogById", blog.getBlogById);
router.post("/getBlogByCategory", blog.getBlogByCategory);
router.delete(
  "/delete-blog",
  isAuthenticated(["USER", "ADMIN"]),
  blog.deleteBlog
);

// Booking
router.get("/service/available/:zip", service.serviceAvailable);
router.get("/service/allservices", service.getServices);
router.get("/get-cities", service.getCities);
router.get("/service/questions/:service", service.getServiceQuestions);
router.post(
  "/service/booking",
  isAuthenticated(["USER", "ADMIN"]),
  service.createBooking
);

//ADMIN
router.get(
  "/admin/bookings",
  isAuthenticated(["USER", "ADMIN"]),
  service.getBookings
);
router.get(
  "/user/bookings",
  isAuthenticated(["USER", "ADMIN"]),
  service.getBookingById
);
router.get(
  "/user/history",
  isAuthenticated(["USER", "ADMIN"]),
  service.getBookingHistory
);
router.post(
  "/admin/reject",
  isAuthenticated(["USER", "ADMIN"]),
  service.rejectBooking
);

router.post(
  "/user/booking-update",
  isAuthenticated(["USER", "ADMIN"]),
  service.updateBooking
);

router.post(
  "/user/invite",
  isAuthenticated(["USER", "ADMIN", "CLEANER"]),
  service.jobinvite
);

router.post(
  "/user/comfirmJobs",
  isAuthenticated(["USER", "ADMIN", "CLEANER"]),
  service.getComFirmJob
);

router.get(
  "/user/jobhistory/:filter",
  isAuthenticated(["USER", "ADMIN", "CLEANER"]),
  service.userBookingHistory
);

router.post(
  "/user/job-accept-reject",
  isAuthenticated(["USER", "ADMIN", "CLEANER"]),
  service.jobAcceptReject
);

router.get(
  "/user/getinvite",
  isAuthenticated(["USER", "ADMIN", "CLEANER"]),
  service.getjobinviteByUser
);

router.post(
  "/user/addreport",
  isAuthenticated(["USER", "ADMIN", "CLEANER"]),
  service.addIncident
);
router.get(
  "/user/getreport",
  isAuthenticated(["USER", "ADMIN", "CLEANER"]),
  service.getIncidents
);
router.get("/user/config", service.getConfig);

router.post("/add-subscriber", user.addNewsLetter);

router.get("/get-subscriber", user.getNewsLetter);

module.exports = router;
