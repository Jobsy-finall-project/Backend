export function admin(req, res, next) {
  if (req.user.role !== "Admin") return res.status(403).send("Access denied");
  next();
}

export function user(req, res, next) {
  if (req.user.role !== "User") return res.status(403).send("Access denied");
  next();
}

