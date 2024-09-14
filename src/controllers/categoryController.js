import Category from "../schema/models/Category.js";

export const categoryController = {
  create: async (req, res) => {
    try {
      const newCategory = new Category(req.body);
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedCategory) return res.status(404).json({ message: "Category not found" });
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const deletedCategory = await Category.findByIdAndDelete(req.params.id);
      if (!deletedCategory) return res.status(404).json({ message: "Category not found" });
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};