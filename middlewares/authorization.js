const authorizationMiddleware = {};

authorizationMiddleware.isAdmin = (req, res, next) => {
  const { currentUserRole } = req;
  if (currentUserRole === "Admin") next();
};

module.exports = authorizationMiddleware;
