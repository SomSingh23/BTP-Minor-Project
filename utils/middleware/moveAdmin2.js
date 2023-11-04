let checkAdmin = require("../functions/checkAdmin");
let moveAdmin2 = (req, res, next) => {
  let adminNo = checkAdmin(req);
  if (adminNo === 2) {
    next();
  } else {
    req.session.kahaPer = req.originalUrl;
    res.redirect("/login");
  }
};
module.exports = moveAdmin2;
