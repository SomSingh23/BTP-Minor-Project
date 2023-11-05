require("dotenv").config();
let mongoose = require("mongoose");
let User = require("./models/user");
mongoose
  .connect(process.env.CONNECT_MONGODB)
  .then((p) => {
    console.log("Connected to MongoDB Mumbai Servers");
  })
  .catch((err) => console.error(err));
let create = async (username, password, _adminNo) => {
  let newUser = new User({ username, adminNo: _adminNo });
  let data = await User.register(newUser, password);
  console.log(data);
};
