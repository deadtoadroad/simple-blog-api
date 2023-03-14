/* @jest-environment ./tests/test-postgres-schema-node-environment */

import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { app } from "../../src/app";

const prisma: PrismaClient = new PrismaClient();

describe("users", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  describe("POST /users", () => {
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

    it("does not return the user password", async () => {
      const response = await request(app).post("/users").send({
        name: "Adam",
        email: "adam@boddington.net",
        password: "password",
      });
      expect(response.status).toBe(200);
      expect(response.body.password).toBeUndefined();
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

  describe("POST /users/login", () => {
    beforeEach(async () => {
      await request(app).post("/users").send({
        name: "Adam",
        email: "adam@boddington.net",
        password: "password",
      });
    });

    it("returns error if email is not found", async () => {
      const response = await request(app).post("/users/login").send({
        email: "nobody",
        password: "password",
      });
      expect(response.status).toBe(200);
      expect(response.body.errors).toHaveLength(1);
    });

    it("return error if password is incorrect", async () => {
      const response = await request(app).post("/users/login").send({
        email: "adam@boddington.net",
        password: "wrong",
      });
      expect(response.status).toBe(200);
      expect(response.body.errors).toHaveLength(1);
    });

    it("returns a JWT for a successful login", async () => {
      const response = await request(app).post("/users/login").send({
        email: "adam@boddington.net",
        password: "password",
      });
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });
  });
});
