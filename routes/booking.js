const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

router.post('/booking', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const Booking = db.collection("booking");
        const bookingDetails = req.body;
        const { date, employee, service, slot } = bookingDetails;

        // Validate request body
        if (!bookingDetails || !date || !employee || !service || !slot) {
            return res.status(400).send({
                status: false,
                message: "Invalid booking details."
            });
        }

        const query = {
            date,
            "employee._id": employee._id,
            "service._id": service._id,
            "slot._id": slot._id
        };

        // Check if the slot is already booked
        const bookings = await Booking.find(query).toArray();

        if (bookings.length > 0) {
            return res.status(409).send({
                status: false,
                message: "This slot is not available at this moment. Please choose another slot or try again later."
            });
        }

        // Insert booking
        await Booking.insertOne(bookingDetails);

        res.status(201).send({
            status: true,
            message: "Successfully Booked this slot!"
        });
    } catch (error) {
        console.error("Error processing booking:", error);
        res.status(500).send({
            status: false,
            message: "Internal Server Error"
        });
    }
});

// get all bookings
router.get('/bookings', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const Booking = db.collection("booking");
        const bookings = await Booking.find({}).toArray();

        if(bookings.length > 0) {
            res.status(200).send({
                status: true,
                message: "Bookings found",
                bookings
            });
        } else {
            res.status(404).send({
                status: false,
                message: "No bookings found"
            })
        }
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
});

// get booking by id
router.get('/bookings/:id', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const id = req.params.id;
        const Booking = db.collection("booking");
        const booking = await Booking.findOne({ _id: new ObjectId(id) });

        if(booking) {
            res.status(200).send({
                status: true,
                message: "Booking found",
                booking
            })
        } else {
            res.status(404).send({
                status: false,
                message: "Booking not found"
            })
        }
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
})

// update booking by id
router.patch('/bookings/:id', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const id = req.params.id;
        const Booking = db.collection("booking");
        const updatedBooking = await Booking.updateOne({ _id: new ObjectId(id) }, { $set : req.body });
        if(updatedBooking) {
            res.status(200).send({
                status: true,
                message: "Booking updated",
            })
        } else {
            res.status(404).send({
                status: false,
                message: "Booking not found"
            })
        }
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
})

// delete booking by id
router.delete('/bookings/:id', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const id = req.params.id;
        const Booking = db.collection("booking");
        const deletedBooking = await Booking.deleteOne({ _id: new ObjectId(id) });
        if(deletedBooking) {
            res.status(200).send({
                status: true,
                message: "Booking deleted",
            })
        } else {
            res.status(404).send({
                status: false,
                message: "Booking not found"
            })
        }
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
})


module.exports = router;