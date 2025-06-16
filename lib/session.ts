import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionPayload } from "./validation";

const secretKey = process.env.AUTH_SECRET;

const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(key); // Removed setExpirationTime to make JWT not expire
}

export async function decrypt(session: string | undefined = "") {
  try {
    if (!session) {
      return null;
    }
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });

    return payload;
  } catch (error) {
    console.log("Failed to decrypt session", error);

    return null;
  }
}

export async function createSession(userId: string) {
  const session = await encrypt({ userId });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  redirect("/dashboard");
}

export async function verifySession() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/");
  }

  return { isAuth: true, userId: session.userId };
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSessionData() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session) {
    return null;
  }

  return session;
}
