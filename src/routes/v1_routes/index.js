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

router.post("/getInTouch", user.createGetInTouch);
router.get("/get-getInTouch", user.getGetInTouch);

//blogs
router.get("/getblogcategory", blog.getBloggCategory);
router.post("/create-blog", blog.createBlog);
router.get("/get-blog", blog.getBlog);
router.post("/update-blog", blog.updateBlog);
router.delete("/delete-blog", blog.deleteBlog);


// Booking
router.get("/service/available", service.serviceAvailable);


module.exports = router;
