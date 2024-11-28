const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const SSLCommerzPayment = require('sslcommerz-lts')
require("dotenv").config()
const {store_id, store_passwd} = process.env
const is_live = false

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

// implement sslcommerz payment gateway
router.get('/pay/:amount/:trxId', (req, res) => {
    const { amount, trxId } = req.params;
    const data = {
        total_amount: Number(amount),
        currency: 'BDT',
        tran_id: trxId, // use unique tran_id for each api call
        success_url: `http://localhost:5000/success/${trxId}`,
        fail_url: `http://localhost:5000/fail/${trxId}`,
        cancel_url: `http://localhost:5000/cancel/${trxId}`,
        ipn_url: 'http://localhost:5000/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        GatewayPageURL && res.send({
            status: true,
            payment_link: GatewayPageURL
        })
    });
})

router.post('/success/:trxId', async (req, res) => {
    const { trxId } = req.params;
    const paymentDetails = {
        status: 'success',
    }
    try {
        const db = mongoose.connection.db;
        const Booking = db.collection("booking");
        const result = await Booking.updateOne({ trxId }, { $set: paymentDetails });
        if(result) {
            res.redirect('http://localhost:3000/dashboard'); 
        } else {
            res.status(400).send({ status: false, message: 'Failed to update booking' });
        }
    } catch (error) {
        res.send({
            status: false,
            message: error.message,
        })
    }
})

router.post('/fail/:trxId', async (req, res) => {
    const { trxId } = req.params;
    const paymentDetails = {
        status: 'fail',
    }
    try {
        const db = mongoose.connection.db;
        const Booking = db.collection("booking");
        const result = await Booking.updateOne({ trxId }, { $set: paymentDetails });
        if(result) {
            res.redirect('http://localhost:3000/dashboard'); 
        } else {
            res.status(400).send({ status: false, message: 'Failed to update booking' });
        }
    } catch (error) {
        res.send({
            status: false,
            message: error.message,
        })
    }
})

router.post('/cancel/:trxId', async (req, res) => {
    const { trxId } = req.params;
    const paymentDetails = {
        status: 'cancel',
    }
    try {
        const db = mongoose.connection.db;
        const Booking = db.collection("booking");
        const result = await Booking.updateOne({ trxId }, { $set: paymentDetails });
        if(result) {
            res.redirect('http://localhost:3000/dashboard'); 
        } else {
            res.status(400).send({ status: false, message: 'Failed to update booking' });
        }
    } catch (error) {
        res.send({
            status: false,
            message: error.message,
        })
    }
})

// get single payment by email
router.get('/payments/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const db = mongoose.connection.db;
        const Booking = db.collection("booking");
        const payments = await Booking.find({ email }).toArray();

        if( payments.length > 0 ) {
            res.send({ status: true, payments });
        } else {
            res.status(404).send({ status: false, message: 'No payment found' });
        }
    } catch (error) {
        res.status(500).send( { status: false, message: error.message } );
    }
})

// get employee payments by employee name (just for testing)
router.get('/employee-payments/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const db = mongoose.connection.db;
        const Booking = db.collection("booking");
        const payments = await Booking.find({ "employee.name": name }).toArray();
        if( payments.length > 0 ) {
            res.status(200).send({ status: true, payments });
        } else {
            res.status(404).send({ status: false, message: 'No payment found' });
        }
    } catch (error) {
        res.status(500).send( { status: false, message: error.message } );
    }
})

module.exports = router;