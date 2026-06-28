const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
mongoose.connect(process.env.MONGODB_URI).then(() => console.log('thành công kết nối')).catch((error) => console.log('lỗi kết nối mongo', error))

// Middleware
app.use(cors());
app.use(express.json());

// Routes cơ bản
app.get('/', (req, res) => {
  res.send('API Backend đang hoạt động!');
});

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
