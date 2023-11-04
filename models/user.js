let mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoose");
var findOrCreate = require("mongoose-findorcreate");
let Schema = new mongoose.Schema({
  username: String,
  googleId: String,
  password: String,
  adminNo: Number,
});
Schema.plugin(findOrCreate);
Schema.plugin(passportLocalMongoose);
let User = mongoose.model("User", Schema);
module.exports = User;
