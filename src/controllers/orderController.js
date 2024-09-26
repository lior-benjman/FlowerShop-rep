import Order from "../schema/models/Order.js";
import User from "../schema/models/User.js";
import Flower from "../schema/models/Flower.js";

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
      const orders = await Order.find()
        .populate('user', 'username')
        .populate('items.flower', 'name')
        .sort({ orderDate: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('user', 'username')
        .populate('items.flower', 'name');
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
  },

  createFromCart: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { userId, shippingAddress } = req.body;
      const user = await User.findById(userId).populate('cart.items.flower');
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.cart || user.cart.length === 0 || user.cart[0].items.length === 0) {
        throw new Error("Cart is empty");
      }

      const orderItems = [];
      for (const item of user.cart[0].items) {
        const flower = await Flower.findById(item.flower._id).session(session);
        if (!flower) {
          throw new Error(`Flower with id ${item.flower._id} not found`);
        }

        if (flower.stock < item.quantity) {
          throw new Error(`Not enough stock for ${flower.name}`);
        }

        // Update stock
        flower.stock -= item.quantity;
        await flower.save({ session });

        orderItems.push({
          flower: flower._id,
          quantity: item.quantity,
          price: flower.price
        });
      }

      const newOrder = new Order({
        user: userId,
        items: orderItems,
        totalAmount: user.cart[0].totalAmount,
        shippingAddress,
        status: 'Pending'
      });

      await newOrder.save({ session });

      // Clear user's cart
      user.cart = [{ items: [], totalAmount: 0 }];
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json(newOrder);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ message: error.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getOrdersByStatus: async (req, res) => {
    try {
      const { status } = req.params;
      const orders = await Order.find({ status }).populate('user').populate('items.flower');
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  generateOrderReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const orders = await Order.find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).populate('items.flower');
      
      const report = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0)
        //More Data Needed
      };
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  cancelOrder: async (req, res) => {
    try {
      console.log("Reached");
      const { id } = req.params;
      const order = await Order.findById(id).populate('items.flower');
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.status !== 'Pending') return res.status(400).json({ message: "Can only cancel pending orders" });
  
      order.status = 'Cancelled';
      await order.save();
  
      // Restore inventory
      console.log(order.items);
      for (let item of order.items) {
        await Flower.findByIdAndUpdate(item.flower._id, { $inc: { stock: item.quantity } });
      }
  
      res.json(order);
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(400).json({ message: error.message });
    }
  },

  getOrderDetails: async (req, res) => {
    try {
      const order = await Order.findById(req.params.orderId)
        .populate('user', 'username email')
        .populate('items.flower', 'name price');
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};