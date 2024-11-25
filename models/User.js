const mongoose = require("mongoose")
const { Schema, model } = mongoose

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please enter your name."]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Please enter your email"],
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, "Please enter your password."],
        minLength: [6,  "Password must be at least 6 characters."]
    },
    role: {
        type: String,
        enum: ["user", "admin", "employee"],
        default: "user"
    }
},
{
    timestamps: true
})

userSchema.pre('save', function(next) {
    if (this.isModified('password')) {
        if (this.password.length < 6) {
            return next(new Error('Password must be at least 6 characters.'));
        }
    }
    next();
});

const User = model("Users", userSchema)
module.exports = User