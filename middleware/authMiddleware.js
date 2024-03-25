const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const getTokenFrom = async (req) => {
  const authorization = req.headers.authorization;

  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }

  return null;
};

const authMiddleware = {
  verifyAccessToken: async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
      return res.json({ error: "Token not found" });
    }

    let getToken = await getTokenFrom(req);
    try {
      jwt.verify(getToken, config.JWT_SECRET, (error, decodedToken) => {
        if (error) {
          return res.status(401).json({ error: "Token is invalid" });
        }

        req.userId = decodedToken.id;
        next();
      });
    } catch (error) {
      return res.status(500).json({ error: "Token is invalid" });
    }
  },
};
module.exports = {authMiddleware,getTokenFrom};
