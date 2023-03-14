import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { RequestHandler, Router } from "express";
import { sign } from "jsonwebtoken";
import { omit } from "lodash/fp";
import { isNullOrUndefined } from "./utilities";
import { validate, validateModelProperty } from "./validation";

export const post =
  (prisma: PrismaClient): RequestHandler =>
  async (req, res) => {
    const user = req.body;
    const errors = validate<User>(
      user,
      validateModelProperty(
        "name",
        isNullOrUndefined,
        "The property 'name' is null or undefined"
      ),
      validateModelProperty(
        "email",
        isNullOrUndefined,
        "The property 'email' is null or undefined"
      ),
      validateModelProperty(
        "password",
        isNullOrUndefined,
        "The property 'password' is null or undefined"
      )
    );
    if (errors.length > 0) {
      res.status(400);
      res.json({ errors });
      return;
    }
    const { name, email, password } = user;
    // https://codahale.com/how-to-safely-store-a-password/
    const hash = await bcrypt.hash(password, 10);
    // The first user is granted admin.
    const count = await prisma.user.count({});
    const result = await prisma.user.create({
      data: { name, email, password: hash, isAdmin: count === 0 },
    });
    res.json(omit("password", result));
  };

export const loginPost =
  (prisma: PrismaClient): RequestHandler =>
  async (req, res) => {
    const { email, password } = req.body;
    let user: User;
    try {
      user = await prisma.user.findUniqueOrThrow({ where: { email } });
    } catch {
      res.json({ errors: ["Incorrect email or password"] });
      return;
    }
    const isSuccess = await bcrypt.compare(password, user.password);
    if (!isSuccess) {
      res.json({ errors: ["Incorrect email or password"] });
      return;
    }
    // Create a JWT and return it.
    const token = sign(omit("password", user), process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.json({ token });
  };

export const users = (prisma: PrismaClient) =>
  Router().post("/", post(prisma)).post("/login", loginPost(prisma));
