// src/utils/tokens.ts - SECURE VERSION
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes in seconds
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

export interface TokenPayload extends JWTPayload {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  tokenType: "access" | "refresh";
}

// 🔥 SECURE: Generate Access Token
export async function generateAccessToken(user: {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
}): Promise<string> {
  try {
    return await new SignJWT({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      tokenType: "access",
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY)
      .setSubject(user.id)
      .setIssuer('msg-admin')
      .setAudience('msg-api')
      .sign(JWT_SECRET);
  } catch (error) {
    console.error('Failed to generate access token:', error);
    throw new Error('Token generation failed');
  }
}

// 🔥 SECURE: Generate Refresh Token
export async function generateRefreshToken(user: {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
}): Promise<string> {
  try {
    return await new SignJWT({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      tokenType: "refresh",
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY)
      .setSubject(user.id)
      .setIssuer('msg-admin')
      .setAudience('msg-api')
      .sign(JWT_SECRET);
  } catch (error) {
    console.error('Failed to generate refresh token:', error);
    throw new Error('Refresh token generation failed');
  }
}

// 🔥 STRICT: Verify Access Token (MUST reject invalid tokens)
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    // Strict validation - ANY modification should fail
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'msg-admin',
      audience: 'msg-api',
    });

    // Verify token type
    if (payload.tokenType !== "access") {
      console.error("❌ Invalid token type:", payload.tokenType);
      return null;
    }

    // Verify expiration (jwtVerify should handle this, but double-check)
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error("❌ Token expired");
      return null;
    }

    console.log("✅ Access token verified for user:", payload.id);
    return payload as TokenPayload;

  } catch (error) {
    // This should catch ANY token tampering
    console.error("❌ Access token verification failed:", error.message);
    return null;
  }
}

// 🔥 STRICT: Verify Refresh Token
export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'msg-admin',
      audience: 'msg-api',
    });

    if (payload.tokenType !== "refresh") {
      console.error("❌ Invalid refresh token type:", payload.tokenType);
      return null;
    }

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error("❌ Refresh token expired");
      return null;
    }

    console.log("✅ Refresh token verified for user:", payload.id);
    return payload as TokenPayload;

  } catch (error) {
    console.error("❌ Refresh token verification failed:", error.message);
    return null;
  }
}

// Generate Both Tokens
export async function generateTokenPair(user: {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
}) {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user),
    generateRefreshToken(user),
  ]);

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY,
    tokenType: "Bearer",
  };
}

// Extract token from Authorization header
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// 🔥 NEW: Cookie utilities
export function createSecureCookieHeader(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict; Path=/`;
}

export function createDeleteCookieHeader(name: string): string {
  return `${name}=; Max-Age=0; HttpOnly; Secure; SameSite=Strict; Path=/`;
}