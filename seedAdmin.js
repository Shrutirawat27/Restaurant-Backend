require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashed = await bcrypt.hash('zaika@admin', 10);
  await Admin.create({ username: 'admin', passwordHash: hashed });
//   console.log('✅ Admin created: admin / zaika@admin');
  process.exit();
});
