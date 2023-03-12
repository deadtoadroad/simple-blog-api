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

    it("returns a 400 and error messages when body is missing", async () => {
      const response = await request(app).post("/users").send();
      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(3);
    });

    it("returns a 400 and error message when name is missing", async () => {
      const response = await request(app).post("/users").send({
        email: "adam@boddington.net",
        password: "password",
      });
      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(1);
    });

    it("returns a 400 and error message when email is missing", async () => {
      const response = await request(app).post("/users").send({
        name: "Adam",
        password: "password",
      });
      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(1);
    });

    it("returns a 400 and error message when password is missing", async () => {
      const response = await request(app).post("/users").send({
        name: "Adam",
        email: "adam@boddington.net",
      });
      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(1);
    });

    it("creates a user with a safely stored password", async () => {
      const response = await request(app).post("/users").send({
        name: "Adam",
        email: "adam@boddington.net",
        password: "password",
      });
      expect(response.status).toBe(200);
      const user = await prisma.user.findFirstOrThrow({});
      expect(user.password).toMatch(/^\$2b\$10\$/);
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
