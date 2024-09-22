import User from "../schema/models/User.js";
import bcrypt from 'bcrypt';

export const userController = {

  //CRUD
  create: async (req, res) => {
    try {
      const newUser = new User(req.body);
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //Cart
  addToCart: async (req, res) => {
    try {
      const { userId, flowerId, quantity } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const flower = await Flower.findById(flowerId);
      if (!flower) return res.status(404).json({ message: "Flower not found" });

      if (!user.cart || user.cart.length === 0) {
        user.cart = [{ items: [], totalAmount: 0 }];
      }

      const cartItemIndex = user.cart[0].items.findIndex(item => item.flower.toString() === flowerId);
      
      if (cartItemIndex > -1) {
        user.cart[0].items[cartItemIndex].quantity += quantity;
      } else {
        user.cart[0].items.push({ flower: flowerId, quantity });
      }

      user.cart[0].totalAmount = user.cart[0].items.reduce((total, item) => {
        return total + (item.quantity * flower.price);
      }, 0);

      await user.save();
      res.json(user.cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  removeFromCart: async (req, res) => {
    try {
      const { userId, flowerId } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.cart || user.cart.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      user.cart[0].items = user.cart[0].items.filter(item => item.flower.toString() !== flowerId);

      const flowers = await Flower.find({ _id: { $in: user.cart[0].items.map(item => item.flower) } });
      user.cart[0].totalAmount = user.cart[0].items.reduce((total, item) => {
        const flower = flowers.find(f => f._id.toString() === item.flower.toString());
        return total + (item.quantity * flower.price);
      }, 0);

      await user.save();
      res.json(user.cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  updateCartItemQuantity: async (req, res) => {
    try {
      const { userId, flowerId, quantity } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.cart || user.cart.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const cartItemIndex = user.cart[0].items.findIndex(item => item.flower.toString() === flowerId);
      if (cartItemIndex === -1) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      user.cart[0].items[cartItemIndex].quantity = quantity;

      const flowers = await Flower.find({ _id: { $in: user.cart[0].items.map(item => item.flower) } });
      user.cart[0].totalAmount = user.cart[0].items.reduce((total, item) => {
        const flower = flowers.find(f => f._id.toString() === item.flower.toString());
        return total + (item.quantity * flower.price);
      }, 0);

      await user.save();
      res.json(user.cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  clearCart: async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.cart = [{ items: [], totalAmount: 0 }];
      await user.save();
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  //Password
  changePassword: async (req, res) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  //Orders
  getUserOrders: async (req, res) => {
    try {
      const { userId } = req.params;
      const orders = await Order.find({ user: userId }).populate('items.flower');
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  //Profile
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).select('-password');
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateUserProfile: async (req, res) => {
    try {
      const { firstName, lastName, address } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { firstName, lastName, address },
        { new: true }
      ).select('-password');
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

};