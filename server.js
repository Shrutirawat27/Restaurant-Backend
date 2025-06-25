require('dotenv').config();
// console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Dish = require('./models/Dish');
const Admin = require('./models/Admin');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Image upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Public API - Get all dishes
app.get('/api/dishes', async (req, res) => {
  const dishes = await Dish.find();
  res.json(dishes);
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// Admin APIs (secured)
app.get('/api/admin/dishes', auth, async (req, res) => {
  const dishes = await Dish.find();
  res.json(dishes);
});

app.post('/api/admin/dishes', auth, upload.single('image'), async (req, res) => {
  const { name, description, price, special, category } = req.body;
   // Convert special to boolean
  const isSpecial = special === "true";

  // 🔴 Validate image required if it's a special dish
  if (isSpecial && !req.file) {
    return res.status(400).json({ message: "Image is required for special dishes." });
  }
  const dish = new Dish({
  name,
  description,
  price,
  special: isSpecial,
  category: isSpecial ? undefined : category,
  imageUrl: req.file ? '/uploads/' + req.file.filename : undefined,
 });
  await dish.save();
  res.json(dish);
});

app.get('/api/special-dishes', async (req, res) => {
  const specials = await Dish.find({ special: true });
  res.json(specials);
});


app.put('/api/admin/dishes/:id', auth, upload.single('image'), async (req, res) => {
  const { name, description, price } = req.body;
  const update = { name, description, price };
  if (req.file) update.imageUrl = '/uploads/' + req.file.filename;

  const dish = await Dish.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(dish);
});

app.delete('/api/admin/dishes/:id', auth, async (req, res) => {
  await Dish.findByIdAndDelete(req.params.id);
  res.json({ message: 'Dish deleted' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
