let checkAdmin = (req) => {
  // must use moveNext before passing to this route
  if (req.user === undefined) return -1;
  else {
    let adminNo = req.user.adminNo;
    if (adminNo === undefined) return 0;
    return adminNo;
  }
};
module.exports = checkAdmin;
