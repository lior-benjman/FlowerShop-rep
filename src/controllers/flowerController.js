import Flower from './models/Flower.js';

export const getAllFlowers = async (req, res) => {
  try {
    const flowers = await Flower.find();
    res.json(flowers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFlower = async (req, res) => {
  try {
    const newFlower = new Flower(req.body);
    await newFlower.save();
    res.status(201).json(newFlower);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};