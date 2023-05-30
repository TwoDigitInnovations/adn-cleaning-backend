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
router.get("/profile", isAuthenticated(["USER", "ADMIN"]), user.me);
router.get(
  "/updateprofile",
  isAuthenticated(["USER", "ADMIN"]),
  user.updateUser
);

router.post("/getInTouch", user.createGetInTouch);
router.get("/get-getInTouch", user.getGetInTouch);

//blogs
router.get("/getblogcategory", blog.getBloggCategory);
router.post("/create-blog", blog.createBlog);
router.get("/get-blog", blog.getBlog);
router.post("/update-blog", blog.updateBlog);
router.post("/getBlogById", blog.getBlogById);
router.post("/getBlogByCategory", blog.getBlogByCategory);
router.delete("/delete-blog", blog.deleteBlog);

// Booking
router.get("/service/available/:zip", service.serviceAvailable);
router.get("/service/allservices", service.getServices);
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

module.exports = router;
