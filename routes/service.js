const express = require("express");
const router = express.Router();
const multer = require("multer");
const Service = require("../models/Service");
const path = require("path");
const fs = require("fs/promises");
const { GoogleGenerativeAI } = require("@google/generative-ai")
require("dotenv").config();

const { GOOGLE_API_KEY } = process.env;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Create Service
router.post("/service", upload.single('image'), async (req, res) => {
    try {
        const { name, category, details, image } = req.body;
        const imagePath = req.file? `/uploads/${req.file.filename}` : image

        if(!imagePath){
            return res.status(400).json({ message: 'Image file or URL is required' });
        }
        const service = new Service({
            name,
            category,
            details,
            image: imagePath
        })
        await service.save();
        res.status(201).json({
            status: true,
            message: "Service created successfully",
            service
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
});

//generate service detailes through AI
router.post("/service/generate-details", async (req, res) => {
    try {
        const { serviceName } = req.body
        const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });
        const prompt = `Write a detailed and professional description for a service called ${serviceName}`
        const result = await model.generateContent({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: prompt,
                  }
                ],
              }
            ],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 2.0,
            },
          });
          res.json({ details: result.response.text() });
    } catch (error) {
        res.json({message: error.message})   
    }
});






// Get All Services
router.get("/services", async (req, res) => {
    try {
        const services = await Service.find({});
        if(services.length === 0) {
            res.status(404).json({
                status: false,
                message: "No services found"
            });
        } else {
            res.status(200).json({
                status: true,
                message: "Services found successfully",
                services
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
});


// Get Service by ID
router.get("/service/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const service = await Service.findById(id);
        if(!service) {
            res.status(404).json({
                status: false,
                message: "Service not found"
            });
        } else {
            res.status(200).json({
                status: true,
                message: "Service found successfully",
                service
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});


// Update Service
router.patch("/service/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const service = await Service.findByIdAndUpdate(id, req.body, {new: true});
        if(!service) {
            res.status(404).json({
                status: false,
                message: "Service not found"
            });
        } else {
            res.status(200).json({
                status: true,
                message: "Service updated successfully",
                service
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});


// Delete Service
router.delete("/service/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const service = await Service.findByIdAndDelete(id);
        if(!service) {
            res.status(404).json({
                status: false,
                message: "Service not found"
            });
        } else {

            if(service.image && !isUrl(service.image)) {
                const filePath = path.join(__dirname, '..', service.image);
                try {
                    await fs.unlink(filePath)
                } catch (error) {
                    
                }
            }

            res.status(200).json({
                status: true,
                message: "Service deleted successfully"
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
})



const isUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
};


module.exports = router;
