import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const TOKEN_NAME = "@personal-drive/auth-token";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change";
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(username: string): Promise<string> {
  const secret = getJwtSecret();
  const jwt = await new SignJWT({ role: "admin", username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE_SECONDS}s`)
    .sign(secret);
  return jwt;
}

export async function verifyAuthToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });

    if (payload.role !== "admin") {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE = {
  name: TOKEN_NAME,
  maxAge: TOKEN_MAX_AGE_SECONDS,
} as const;


