let mongoose = require("mongoose");
let Schema = new mongoose.Schema({
  googleId: String,
  email: String,
});
let Email = mongoose.model("Email", Schema);
module.exports = Email;
