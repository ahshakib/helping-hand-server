const handleMongooseError = (error) => {
    const  errors = {}

    if(error.name === "ValidationError") {
        Object.keys(error.errors).forEach((field) => {
            errors[field] = error.errors[field].message
        })
    }

    if(error.name === "MongoServerError" &&  error.code === 11000) {
        const field = Object.keys(error.keyValue)[0]
        errors[field] = `This ${field} is already exist`
    }

    if(Object.keys(error).length === 0) {
        console.error("Unknown error: ", error)
        errors.general = "An unknown error occurred. Please try again later."

    }

    return errors

}

const errorResponse = (error, res) => {
    const formattedError = handleMongooseError(error)

    const statusCode = formattedError.hasOwnProperty("general")? 500 : 400

     return res.status(statusCode).json({
        status: false,
        message: formattedError.hasOwnProperty("email") ? formattedError["email"] : formattedError.hasOwnProperty("password") ? formattedError["password"] : formattedError["general"]
    })
}

module.exports = { handleMongooseError, errorResponse }