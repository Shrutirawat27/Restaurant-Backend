const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  special: {
    type: Boolean,
    default: false,
  },
  imageUrl: String,
  category: String,
});

module.exports = mongoose.model('Dish', DishSchema);