let moveAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.session.kahaPer = req.originalUrl;
    res.redirect("/login");
  }
};
module.exports = moveAdmin;
