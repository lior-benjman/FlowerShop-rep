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
    try {
        const { userId } = req.params;
        const { shippingAddress } = req.body;
        const user = await User.findById(userId).populate('cart.items.flower');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.cart || user.cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const orderItems = [];
        let totalAmount = 0;
        
        for (const item of user.cart.items) {
            const flower = await Flower.findById(item.flower._id);
            if (!flower) {
                return res.status(404).json({ message: `Flower with id ${item.flower._id} not found` });
            }

            if (flower.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${flower.name}` });
            }

            flower.stock -= item.quantity;
            await flower.save();

            const itemTotal = flower.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                flower: flower._id,
                quantity: item.quantity
            });
        }

        const newOrder = new Order({
            user: userId,
            items: orderItems,
            totalAmount: totalAmount,
            shippingAddress: shippingAddress,
            status: 'Pending'
        });

        await newOrder.save();

        user.cart = { items: [], totalAmount: 0 };
        await user.save();

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: "An error occurred while creating the order" });
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

  getProcessingOrders: async (req, res) => {
    try {
      const processingOrders = await Order.find({ status: 'Processing' });
      const locations = processingOrders.map(order => ({
        id: order._id,
        address: order.shippingAddress
      }));
      res.json(locations);
    } catch (error) {
      console.error('Error fetching processing orders:', error);
      res.status(500).json({ message: 'Error fetching order locations' });
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
  },

  //statistics
  getOrdersRevenueStats: async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const stats = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' }, orderDate: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$orderDate" } },
                    orderCount: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const labels = stats.map(item => item._id);
        const orders = stats.map(item => item.orderCount);
        const revenue = stats.map(item => item.totalRevenue);

        res.json({ labels, orders, revenue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  },

  getRevenueByItemStats: async (req, res) => {
    try {
        const stats = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "flowers",
                    localField: "items.flower",
                    foreignField: "_id",
                    as: "flowerDetails"
                }
            },
            { $unwind: "$flowerDetails" },
            {
                $group: {
                    _id: "$items.flower",
                    name: { $first: "$flowerDetails.name" },
                    totalRevenue: { $sum: { $multiply: ["$items.quantity", "$flowerDetails.price"] } }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    totalRevenue: 1
                }
            }
        ]);

        const labels = stats.map(item => item.name);
        const revenue = stats.map(item => item.totalRevenue);

        res.json({ labels, revenue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  },

  getTopSellingFlowers: async (req, res) => {
    try {
        const stats = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.flower",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "flowers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "flowerDetails"
                }
            },
            { $unwind: "$flowerDetails" },
            {
                $project: {
                    _id: 0,
                    name: "$flowerDetails.name",
                    totalQuantity: 1
                }
            }
        ]);

        const labels = stats.map(item => item.name);
        const quantities = stats.map(item => item.totalQuantity);

        res.json({ labels, quantities });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  }
};