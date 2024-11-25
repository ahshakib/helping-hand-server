const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { errorResponse } = require("../error/errorResponse")


router.post('/register', async(req, res) => {
    try {
        const {name, email, password, role} = req.body

        if (password.length < 6) {
            return res.status(400).json({ status: false, message: "Password must be at least 6 characters." });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password, salt)
        let user = new User({
            name,
            email,
            password: hashedPass,
            role: role ? role : "user"
        })
        await user.save()
        res.status(201).json({
            status: true,
            message: "User created successfully",
            user
        })
    } catch (error) {
        errorResponse(error, res)
    }
})

router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if(!user) {
            res.status(404).json({ 
                status: false,
                message: "User doesn't exist!"
            })
        } else {
            const isValidPassword = await bcrypt.compare(password, user.password)

            if(isValidPassword) {
                res.status(200).json({
                    status: true,
                    message: "User logged in successfully",
                    user
                })
            } else {
                res.status(401).json({
                    status: false,
                    message: "Invalid password"
                })
            }
        }
    } catch (error) {
        errorResponse(error, res)

    }
})

// get user by id

router.get('/user/:id', async(req, res) => {
    try {
        const { id } = req.params
        const user = await  User.findById(id)
        
        if(user) {
            res.status(200).json({
                status: true,
                user
            })
        } else {
            res.status(404).json({
                status: false,
                message: "User not found"
            })
        }
    } catch (error) {
        errorResponse(error, res)
    }
})

// get all user 

router.get('/user', async(req, res) => {
    try {
        const users = await User.find({})
        if(users.length > 0) {
            res.status(200).json({
                status: true,
                users
            })
        } else {
            res.status(404).json({
                status: false,
                message: "No user found"
            })
        }
    } catch (error) {
        errorResponse(error, res)
    }
})


// update user

router.patch('/user/:id', async(req, res) => {
    try {
        const { id } = req.params
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true })

        if(updatedUser) {
            res.status(200).json({
                status: true,
                updatedUser
            })
        } else {
            res.status(404).json({
                status: false,
                message: "User not found"
            })
        }
    } catch (error) {
        errorResponse(error, res)
    }
})


// delete user
router.delete('/user/:id', async(req, res) => {
    try {
        const { id } = req.params
        const user = await User.findByIdAndDelete(id)

        if(user) {
            res.status(200).json({
                status: true,
                message: "User deleted successfully"
            })
        } else {
            res.status(404).json({
                status: false,
                message: "User not found"
            })
        }
    } catch (error) {
        errorResponse(error, res)
    }
})



module.exports = router
