/* @jest-environment ./tests/test-postgres-schema-node-environment */

import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { app } from "../../src/app";

const prisma: PrismaClient = new PrismaClient();

describe("users", () => {
  describe("POST /users", () => {
    beforeEach(async () => {
      await prisma.user.deleteMany({});
    });

    it("creates a user with admin the first time", async () => {
      const response = await request(app).post("/users").send({
        name: "Adam",
        email: "adam@boddington.net",
        password: "password",
      });
      expect(response.status).toBe(200);
      const user = await prisma.user.findFirstOrThrow({});
      expect(user.isAdmin).toBe(true);
    });

    it("creates a user without admin the second time", async () => {
      let response = await request(app).post("/users").send({
        name: "Adam",
        email: "adam@boddington.net",
        password: "password",
      });
      expect(response.status).toBe(200);
      response = await request(app).post("/users").send({
        name: "Olivia",
        email: "olivia@boddington.net",
        password: "password",
      });
      expect(response.status).toBe(200);
      const user = await prisma.user.findUniqueOrThrow({
        where: { email: "olivia@boddington.net" },
      });
      expect(user.isAdmin).toBe(false);
    });
  });
});
