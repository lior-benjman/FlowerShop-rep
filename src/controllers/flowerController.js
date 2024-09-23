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
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const flowers = await Flower.find()
        .skip(skip)
        .limit(limit);

      const total = await Flower.countDocuments();

      res.json({
        flowers,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const flower = await Flower.findById(req.params.id);
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
  },

  searchFlowers: async (req, res) => {
    try {
      const { query } = req.query;
      const flowers = await Flower.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      });
      res.json(flowers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getFlowersByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      const flowers = await Flower.find({ category: category });
      res.json(flowers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getFlowersByColor: async (req, res) => {
    try {
      const { color } = req.params;
      const flowers = await Flower.find({ color: color });
      res.json(flowers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateStock: async (req, res) => {
    try {
      const { flowerId, quantity } = req.body;
      const flower = await Flower.findByIdAndUpdate(
        flowerId,
        { $inc: { stockQuantity: quantity } },
        { new: true }
      );
      res.json(flower);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  //Featured Flowers
  getTopSellingFlowers: async (req, res) => {
    try {
      const topFlowers = await Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.flower", totalSold: { $sum: "$items.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        { $lookup: { from: "flowers", localField: "_id", foreignField: "_id", as: "flowerDetails" } },
        { $unwind: "$flowerDetails" },
        { $project: { _id: 1, totalSold: 1, name: "$flowerDetails.name", price: "$flowerDetails.price" } }
      ]);
      res.json(topFlowers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getNewArrivals: async (req, res) => {
    try {
      const newFlowers = await Flower.find()
        .sort({ createdAt: -1 })
        .limit(10);
      res.json(newFlowers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

};