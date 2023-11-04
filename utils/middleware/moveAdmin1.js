let checkAdmin = require("../functions/checkAdmin");
let moveAdmin1 = (req, res, next) => {
  let adminNo = checkAdmin(req);
  if (adminNo === 1) {
    next();
  } else {
    res.redirect("/");
  }
};
module.exports = moveAdmin1;
