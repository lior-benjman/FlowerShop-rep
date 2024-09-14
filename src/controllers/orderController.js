import Order from "../schema/models/Order.js";

export const orderController = {
  create: async (req, res) => {
    try {
      const newOrder = new Order(req.body);
      await newOrder.save();
      res.status(201).json(newOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const orders = await Order.find().populate('user').populate('items.flower');
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('user').populate('items.flower');
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const deletedOrder = await Order.findByIdAndDelete(req.params.id);
      if (!deletedOrder) return res.status(404).json({ message: "Order not found" });
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};