// lib/env.ts
export const SCHOOL = process.env.NEXT_PUBLIC_SCHOOL as "hmt" | "talod";
console.log("school",SCHOOL);

// lib/env.ts


if (!SCHOOL) {
  throw new Error("Missing NEXT_PUBLIC_SCHOOL env variable");
}


export const HONO = 'https://hono.tapovanvidhyamandirsankul.com'
