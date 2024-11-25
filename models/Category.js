const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const categorySchema = new Schema({
    name: String,
});

const Category = model("Categories", categorySchema);

module.exports = Category