let checkAdmin = require("../functions/checkAdmin");
let moveAdmin1 = (req, res, next) => {
  let adminNo = checkAdmin(req);
  if (adminNo === 1) {
    next();
  } else {
    req.session.kahaPer = req.originalUrl;
    res.redirect("/login");
  }
};
module.exports = moveAdmin1;
