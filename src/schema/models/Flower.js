import mongoose from 'mongoose';

const flowerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  inStock: { type: Boolean, default: true },
  imageUrl: String
});

const Flower = mongoose.model('Flower', flowerSchema);

export default Flower;