import mongoose from 'mongoose';

const flowerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: { type: String, required: true },
  color: { type: String, required: true},
  stock: { type: Number, default: true },
  imageUrl: { type: String, required: true },
});

const Flower = mongoose.model('Flower', flowerSchema);

export default Flower;