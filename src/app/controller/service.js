const mongoose = require("mongoose");
const response = require("./../responses");
const Zip = mongoose.model("Zip");

module.exports = {
    serviceAvailable: (req, res) => {
        try {

            return response.ok(res, { available: true, message: "available" });
        } catch (error) {
            return response.error(res, error);
        }
    }

}