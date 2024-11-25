const express = require("express");
const router = express.Router();
const Slot = require("../models/Slot");

/**
 * Create a slot
 * @route POST /slot
 * @access Public
 */
router.post("/slot", async (req, res) => {
  try {
    const { label, start_time, end_time } = req.body;
    if (!label || !start_time || !end_time) {
      return res.status(400).json({
        status: false,
        message: "Please provide all required fields",
      });
    }
    const slot = new Slot({ label, start_time, end_time });
    await slot.save();
    res.status(201).json({
      status: true,
      message: "Slot created successfully",
      slot,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error creating slot",
      error: error.message,
    });
  }
});

/**
 * Get all slots
 * @route GET /slots
 * @access Public
 */
router.get("/slots", async (req, res) => {
  try {
    const slots = await Slot.find({});
    if (slots.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No slots found",
      });
    } else {
      res.status(200).json({
        status: true,
        message: "Slots found successfully",
        slots,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching slots",
      error: error.message,
    });
  }
});

/**
 * Get a single slot by id
 * @route GET /slots/:id
 * @access Public
 */
router.get("/slots/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const slot = await Slot.findById(id);
    if (!slot) {
      return res.status(404).json({
        status: false,
        message: "Slot not found",
      });
    } else {
      res.status(200).json({
        status: true,
        message: "Slot found successfully",
        slot,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching slot",
      error: error.message,
    });
  }
});

/**
 * Update a single slot by id
 * @route PATCH /slots/:id
 * @access Public
 */
router.patch("/slots/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const slot = await Slot.findByIdAndUpdate(id, req.body, { new: true });
    if (!slot) {
      return res.status(404).json({
        status: false,
        message: "Slot not found",
      });
    } else {
      res.status(200).json({
        status: true,
        message: "Slot updated successfully",
        slot,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error updating slot",
      error: error.message,
    });
  }
});

/**
 * Delete a single slot by id
 * @route DELETE /slots/:id
 * @access Public
 */
router.delete("/slots/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const slot = await Slot.findByIdAndDelete(id);
    if (!slot) {
      return res.status(404).json({
        status: false,
        message: "Slot not found",
      });
    } else {
      res.status(200).json({
        status: true,
        message: "Slot deleted successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error deleting slot",
      error: error.message,
    });
  }
});

module.exports = router;