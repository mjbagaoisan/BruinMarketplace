/*
AI-Assisted Code (Documentation Research)

Prompt: How do I implement JWT token generation and verification in Node.js 
using the jsonwebtoken library with HS256 algorithm?

Additional Notes: I used AI to help me understand the jsonwebtoken library 
docs. It suggested using HS256 explicitly, checking for the environment 
variable at startup so the app fails fast, and typing SignOptions properly.
*/
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

// generates a JWT token from JWTPayLoad object
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

/*
AI-Assisted Code (Error Handling)

Prompt: How should I handle JWT verification errors to distinguish between 
expired tokens and invalid tokens?

Additional Notes: I wrote the basic verify function. AI suggested checking 
for TokenExpiredError so the frontend can prompt the user to log in again 
instead of treating it like a security issue.
*/
// verifies a JWT token and returns the decoded payload
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
