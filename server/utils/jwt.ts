import jwt, { type SignOptions } from "jsonwebtoken";

interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

interface DecodedToken extends JWTPayload {
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "1d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): DecodedToken {
  try {
    return jwt.verify(token, JWT_SECRET as string, {
      algorithms: ["HS256"],
    }) as DecodedToken;
  } catch (err: any) {
    if (err && typeof err === "object" && err.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    throw new Error("Invalid token");
  }
}
