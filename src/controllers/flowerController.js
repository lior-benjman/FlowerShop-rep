import Flower from "../schema/models/Flower.js";

export const flowerController = {
  create: async (req, res) => {
    try {
      const newFlower = new Flower(req.body);
      await newFlower.save();
      res.status(201).json(newFlower);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const flowers = await Flower.find().populate('category');
      res.json(flowers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const flower = await Flower.findById(req.params.id).populate('category');
      if (!flower) return res.status(404).json({ message: "Flower not found" });
      res.json(flower);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const updatedFlower = await Flower.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedFlower) return res.status(404).json({ message: "Flower not found" });
      res.json(updatedFlower);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const deletedFlower = await Flower.findByIdAndDelete(req.params.id);
      if (!deletedFlower) return res.status(404).json({ message: "Flower not found" });
      res.json({ message: "Flower deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};