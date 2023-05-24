const mongoose = require("mongoose");
const response = require("./../responses");
const Zip = mongoose.model("Zip");
const fs = require("fs");

module.exports = {
    serviceAvailable: (req, res) => {
        try {

            return response.ok(res, { available: true, message: "available" });
        } catch (error) {
            return response.error(res, error);
        }
    },
    getServiceQuestions: (req, res) => {
        try {
            fs.readFile("./../data/a.json", 'utf-8', (data) => {
                return response.ok(res, { questions: data });
            });

        } catch (error) {
            return response.error(res, error);
        }
    }

}