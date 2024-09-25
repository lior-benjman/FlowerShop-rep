import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  address: String,
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  cart: {
    items: [{
      flower: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true },
      quantity: { type: Number, required: true, min: 1 }
    }],
    totalAmount: { type: Number, default: 0 }
  }
});

const User = mongoose.model('User', userSchema);

export default User;