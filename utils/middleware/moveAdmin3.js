let checkAdmin = require("../functions/checkAdmin");
let moveAdmin3 = (req, res, next) => {
  let adminNo = checkAdmin(req);
  if (adminNo === 3) {
    next();
  } else {
    res.redirect("/");
  }
};
module.exports = moveAdmin3;
