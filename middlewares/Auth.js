import jwt, { decode } from "jsonwebtoken";
import { JWT_SECRET } from "../environment.js";

export const Authenticate = async (req, res, next) => {
  const headers = req.headers.authorization;

  if (headers && headers.startsWith("Bearer")) {
    try {
      const token = headers.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (!decoded) {
        throw new Error("Invalid token");
      }

      req.auth = decoded.id;
      return next();
    } catch (error) {
      req.auth = false;
      next();
    }
  }
  req.auth = false;
  return next();
};

// export const adminMiddleware = (req, res, next) => {

// }
