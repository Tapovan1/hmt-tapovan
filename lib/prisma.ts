import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Alternative approach extending globalThis directly
interface CustomGlobalThis {
  prisma?: ReturnType<typeof prismaClientSingleton>;
}

const prisma =
  (globalThis as unknown as CustomGlobalThis).prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production")
  (globalThis as unknown as CustomGlobalThis).prisma = prisma;
