const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const employeeSchema = new Schema({
    name: String,
    bio: String,
    location: String,
    rate: Number,
    details: String,
    services: [String],
    image: String,
});

const Employee = model("Employee", employeeSchema);

module.exports = Employee