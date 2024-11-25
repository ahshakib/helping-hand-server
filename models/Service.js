const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const serviceSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    details: { type: String, required: true },
    image: { type: String, required: true },
});

const Service = model("Services", serviceSchema);

module.exports = Service;