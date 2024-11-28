const express = require("express");
const connectDB = require("./config/db");
const app = express();
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const { PORT } = process.env;

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());

connectDB();

app.use(require("./routes/user"));
app.use(require("./routes/category"));
app.use(require("./routes/slot"));
app.use(require("./routes/service"));
app.use(require("./routes/employee"));
app.use(require("./routes/booking"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});