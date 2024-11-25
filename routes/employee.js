const express = require("express")
const router = express.Router()
const Employee = require("../models/Employee")

router.post('/employee', async(req, res) => {
    try {
        const employee = new Employee(req.body)
        await employee.save()
        res.status(201).json({
            status: true,
            message: "Employee created successfully",
            employee
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
})

// get all employees

router.get('/employees', async(req, res) => {
    try {
        const employees = await Employee.find({})
        if(employees.length > 0) {
            res.status(200).json({
                status: true,
                message: "Employees found successfully",
                employees
            })
        } else {
            res.status(404).json({
                status: false,
                message: "No employees found"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
})

//get an employee by id
router.get('/employee/:id', async(req, res) => {
    try {
        const id = req.params.id
        const employee = await Employee.findById(id)
        if(employee) {
            res.status(200).json({
                status: true,
                message: "Employee found successfully",
                employee
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Employee not found"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
})

// update an employee
router.patch('/employee/:id', async(req, res) => {
    try {
        const id = req.params.id
        const employee = await Employee.findByIdAndUpdate(id, req.body, {new: true})
        if(employee) {
            res.status(200).json({
                status: true,
                message: "Employee updated successfully",
                employee
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Employee not found"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
})

// delete an employee
router.delete('/employee/:id', async(req, res) => {
    try {
        const id = req.params.id
        const employee = await Employee.findByIdAndDelete(id)
        if(employee) {
            res.status(200).json({
                status: true,
                message: "Employee deleted successfully",
                employee
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Employee not found"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
})

module.exports = router;