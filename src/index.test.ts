import supertest from "supertest";
import { app } from "./index";

describe("Hello world", () => {
  describe("get hello world", () => {
    it('should return "Hello world"', async () => {
      await supertest(app).get("/").expect("Hello world!");
    });
  });
});
