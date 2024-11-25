const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const slotSchema = new Schema({
    label: { type: String, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
})

const Slot = model("Slots", slotSchema);
module.exports = Slot;