let mongoose = require("mongoose");
var findOrCreate = require("mongoose-findorcreate");
let Schema = new mongoose.Schema({
  username: String,
  googleId: String,
});
Schema.plugin(findOrCreate);
let User = mongoose.model("User", Schema);
module.exports = User;
