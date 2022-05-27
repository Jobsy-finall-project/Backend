function admin(req, res, next) {
  if (req.user.role !== "Admin") return res.status(403).send("Access denied");
  next();
}

function hr(req, res, next) {
  if (req.user.role !== "HR") return res.status(403).send("Access denied");
  next();
}
function user(req, res, next) {
  if (req.user.role !== "User") return res.status(403).send("Access denied");
  next();
}

module.exports = {admin, hr, user};
