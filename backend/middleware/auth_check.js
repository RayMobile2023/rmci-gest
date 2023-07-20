import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const {
  JWT_EXPIRATION,
  JWT_REFRESH_EXPIRATION,
  JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN,
} = process.env;

/*************************/
/*** Extraction du token */
const extractBearer = (authorization) => {
  if (typeof authorization !== "string") {
    return false;
  }

  // On isole le token
  const matches = authorization.match(/(bearer)\s+(\S+)/i);

  return matches && matches[2];
};

/******************************************/
/*** Vérification de la présence du token */
export const checkTokenMiddleware = (req, res, next) => {
  const token =
    req.headers.authorization && extractBearer(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ message: "Ho le petit malin !!!" });
  }

  // Vérifier la validité du token
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: "Bad token" });
    }

    next();
  });
};
