import Flower from "../schema/models/Flower.js";
import { app } from "../server/app.js";

export const flowersRoutes = async () => {
  app.post('/', async (req, res) => {
      try {
        const newFlower = new Flower(req.body);
        await newFlower.save();
        res.status(201).json(newFlower);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
  });
  
  app.get('/search', async (req, res) => {
  try {
      const flowers = await Flower.find();
      res.json(flowers);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
  })
};