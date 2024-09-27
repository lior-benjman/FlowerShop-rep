import User from "../schema/models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

  //Registration

  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token, user: { id: user._id, username: user.username, isAdmin: user.isAdmin}});
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  signup: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: "Username or email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(201).json({ token, user: { id: newUser._id, username: newUser.username } });
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

      const cartItemIndex = user.cart.items.findIndex(item => item.flower.toString() === flowerId);
      
      if (cartItemIndex > -1) {
        user.cart.items[cartItemIndex].quantity += quantity;
      } else {
        user.cart.items.push({ flower: flowerId, quantity });
      }

      user.cart.totalAmount = user.cart.items.reduce((total, item) => {
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

      user.cart.items = user.cart.items.filter(item => item.flower.toString() !== flowerId);

      const flowers = await Flower.find({ _id: { $in: user.cart.items.map(item => item.flower) } });
      user.cart.totalAmount = user.cart.items.reduce((total, item) => {
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

      const cartItemIndex = user.cart.items.findIndex(item => item.flower.toString() === flowerId);
      if (cartItemIndex === -1) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      user.cart.items[cartItemIndex].quantity = quantity;

      const flowers = await Flower.find({ _id: { $in: user.cart.items.map(item => item.flower) } });
      user.cart.totalAmount = user.cart.items.reduce((total, item) => {
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

      user.cart = { items: [], totalAmount: 0 };
      await user.save();
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getCart: async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId).populate('cart.items.flower');
      if (!user) return res.status(404).json({ message: "User not found" });

      const cartItems = user.cart.items;
      const totalAmount = user.cart.totalAmount;
      const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

      res.json({ items: cartItems, totalAmount, itemCount });
    } catch (error) {
      res.status(500).json({ message: error.message });
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