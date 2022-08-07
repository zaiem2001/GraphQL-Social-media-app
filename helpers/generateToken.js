import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../environment.js";

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "3h",
  });
};

export default generateToken;
