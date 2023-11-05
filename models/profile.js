let mongoose = require("mongoose");
let Schema = new mongoose.Schema({
  googleId: String,
  email: String,
  picture: String,
  name: String,
  email_verified: Boolean,
});
let Profile = mongoose.model("Profile", Schema);
module.exports = Profile;
