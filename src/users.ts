import { PrismaClient } from "@prisma/client";
import { RequestHandler, Router } from "express";

export const post =
  (prisma: PrismaClient): RequestHandler =>
  async (req, res) => {
    const { name, email, password } = req.body;
    // The first user is granted admin.
    const count = await prisma.user.count({});
    const result = await prisma.user.create({
      data: { name, email, password, isAdmin: count === 0 },
    });
    res.json(result);
  };

export const users = (prisma: PrismaClient) => Router().post("/", post(prisma));
