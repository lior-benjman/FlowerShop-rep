import express from 'express';
import connectDB from './database.js';
import Flower from './models/Flower.js';

export const app = express();
const port = 3000;

app.use(express.json());

connectDB();

app.post('/api/flowers', async (req, res) => {
    try {
        const newFlower = new Flower(req.body);
        await newFlower.save();
        res.status(201).json(newFlower);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


const startServer = () => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};
  
export { startServer };
