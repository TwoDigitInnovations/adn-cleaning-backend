const mongoose = require("mongoose");
const Blog = mongoose.model("Blog");
const response = require("./../responses");

module.exports = {
  getBloggCategory: async (req, res) => {
    return response.ok(res, [
      {
        id: 1,
        name: "Clining Checklists",
      },
      {
        id: 2,
        name: "Clining Tips",
      },
      {
        id: 3,
        name: "Decluttering",
      },
      {
        id: 4,
        name: "Eco living",
      },
      {
        id: 5,
        name: "eMop stories",
      },
    ]);
  },

  createBlog: async (req, res) => {
    try {
      const payload = req?.body || {};
      let blog = new Blog(payload);
      const blg = await blog.save();
      return response.ok(res, blg);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getBlog: async (req, res) => {
    try {
      let blog = await Blog.find().populate("posted_by", "username  email");
      return response.ok(res, blog);
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateBlog: async (req, res) => {
    try {
      const payload = req?.body || {};
      let blog = await Blog.findByIdAndUpdate(payload?.id, payload, {
        new: true,
        upsert: true,
      });
      return response.ok(res, blog);
    } catch (error) {
      return response.error(res, error);
    }
  },

  deleteBlog: async (req, res) => {
    try {
      let blog = await Blog.findByIdAndDelete(req?.body?._id);
      return response.ok(res, { meaasge: "Deleted successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },
};
