const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

/**
 * Create a new category
 * @route POST /category
 * @access Public
 */
router.post('/category', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      status: false,
      message: "Category name is required."
    });
  }

  try {
    const isCategoryExist = Boolean(await Category.findOne({ name }));

    if (isCategoryExist) {
      return res.status(409).json({
        status: false,
        message: "Category already exist with this name."
      });
    }

    const category = new Category({ name });
    await category.save();

    res.status(201).json({
      status: true,
      message: "Category created successfully.",
      category
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
});

/**
 * Get all categories
 * @route GET /categories
 * @access Public
 */
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({});

    if (categories.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No categories found."
      });
    }

    res.status(200).json({
      status: true,
      categories
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message
    });
  }
});

/**
 * Get a single category by id
 * @route GET /categories/:id
 * @access Public
 */
router.get("/categories/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found."
      });
    }

    res.status(200).json({
      status: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
});

/**
 * Update a category
 * @route PATCH /categories/:id
 * @access Public
 */
router.patch("/categories/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found."
      });
    }

    res.status(200).json({
      status: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
});

/**
 * Delete a category
 * @route DELETE /categories/:id
 * @access Public
 */
router.delete("/categories/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found."
      });
    }

    res.status(200).json({
      status: true,
      message: "Category deleted successfully."
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
});

module.exports = router;