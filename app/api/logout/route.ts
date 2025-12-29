import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    (await cookies()).delete("session");
  } catch (e) {
    // ignore if cookie deletion not possible
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export async function POST(request: Request) {
  try {
    (await cookies()).delete("session");
  } catch (e) {
    // ignore
  }

  return NextResponse.redirect(new URL("/", request.url));
}
