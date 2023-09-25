let mongoose = require("mongoose");
let Schema = new mongoose.Schema({
  username: String,
  googleId: String,
  verification1: Boolean,
  verification2: Boolean,
  verification3: Boolean,
  verification1Status: String,
  verification2Status: String,
  verification3Status: String,
  email: String,
  semester: Number,
  currentYear: Number,
  misNo: String,
  isRegistered: Boolean,
  academicFee: String,
});
let Student = mongoose.model("Student", Schema);
module.exports = Student;
