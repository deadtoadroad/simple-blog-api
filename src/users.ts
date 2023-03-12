import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { RequestHandler, Router } from "express";
import { flow } from "lodash/fp";
import { ifMap, isNullOrUndefined } from "./utilities";
import { addError, getErrors, ifModelProperty, initialise } from "./validation";

export const post =
  (prisma: PrismaClient): RequestHandler =>
  async (req, res) => {
    const user = req.body;
    const errors = flow(
      initialise<User>,
      ifMap(
        ifModelProperty("name", isNullOrUndefined),
        addError("The property 'name' is null or undefined")
      ),
      ifMap(
        ifModelProperty("email", isNullOrUndefined),
        addError("The property 'email' is null or undefined")
      ),
      ifMap(
        ifModelProperty("password", isNullOrUndefined),
        addError("The property 'password' is null or undefined")
      ),
      getErrors
    )(user);
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
    res.json(result);
  };

export const users = (prisma: PrismaClient) => Router().post("/", post(prisma));
