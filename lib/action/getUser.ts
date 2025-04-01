import "server-only";
import { cache } from "react";
import prisma from "../prisma";

import { verifySession } from "../session";

export const getUser = cache(async () => {
  const session = await verifySession();

  if (!session) return null;

  const userId = session.userId.toLocaleString();

  try {
    const data = await prisma.user.findMany({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        department: true,
      },
    });

    const user = data[0];

    return user;
  } catch (error) {
    console.log("Failed to fetch user", error);
    return null;
  }
});
