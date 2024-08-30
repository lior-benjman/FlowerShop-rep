import express from 'express';
import connectDB from './config/database.js';


// Import models
import Flower from '../models/Flower.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';

// Import Routes
import flowerRoutes from './routes/flowerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

export const app = express();
const port = 3000;

app.use(express.json());

connectDB();

// Use routes
app.use('/api/flowers', flowerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

// Flower routes
app.post('/api/flowers', async (req, res) => {
    try {
      const newFlower = new Flower(req.body);
      await newFlower.save();
      res.status(201).json(newFlower);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
});
  
app.get('/api/flowers', async (req, res) => {
try {
    const flowers = await Flower.find();
    res.json(flowers);
} catch (error) {
    res.status(500).json({ message: error.message });
}
});

// User routes
app.post('/api/users', async (req, res) => {
try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
} catch (error) {
    res.status(400).json({ message: error.message });
}
});

app.get('/api/users', async (req, res) => {
try {
    const users = await User.find();
    res.json(users);
} catch (error) {
    res.status(500).json({ message: error.message });
}
});

// Order routes
app.post('/api/orders', async (req, res) => {
try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
} catch (error) {
    res.status(400).json({ message: error.message });
}
});

app.get('/api/orders', async (req, res) => {
try {
    const orders = await Order.find();
    res.json(orders);
} catch (error) {
    res.status(500).json({ message: error.message });
}
});

// Category routes
app.post('/api/categories', async (req, res) => {
try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
} catch (error) {
    res.status(400).json({ message: error.message });
}
});

app.get('/api/categories', async (req, res) => {
try {
    const categories = await Category.find();
    res.json(categories);
} catch (error) {
    res.status(500).json({ message: error.message });
}
});


const startServer = () => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};
  
export { startServer };
