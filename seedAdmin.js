require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const existingAdmin = await Admin.findOne({ username: process.env.ADMIN_USERNAME });

    if (existingAdmin) {
      console.log('⚠️ Admin already exists. Skipping creation.');
    } else {
      const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await Admin.create({
        username: process.env.ADMIN_USERNAME,
        passwordHash: hashed
      });
      console.log('✅ Admin user created securely.');
    }
  } catch (err) {
    console.error('❌ Error creating admin:', err);
  } finally {
    process.exit();
  }
});
