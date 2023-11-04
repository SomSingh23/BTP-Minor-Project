let checkAdmin = require("../functions/checkAdmin");
let moveAdmin2 = (req, res, next) => {
  let adminNo = checkAdmin(req);
  if (adminNo === 2) {
    next();
  } else {
    res.redirect("/");
  }
};
module.exports = moveAdmin2;
