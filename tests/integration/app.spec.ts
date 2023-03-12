import request from "supertest";
import { app } from "../../src/app";

describe("app", () => {
  describe("GET /", () => {
    it("returns 404", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(404);
    });
  });
});
