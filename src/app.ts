import { PrismaClient } from "@prisma/client";
import express from "express";
import { users } from "./users";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/users", users(prisma));

export { app };
