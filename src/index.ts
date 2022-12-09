import express, { Request, Response } from "express";
import morgan from "morgan";
import prisma from "./config/client";
import dotenv from "dotenv";

dotenv.config();

export const app = express();
app.use(morgan("dev"));

app.get("/db-test", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1 + 1`;
    res.status(200).send("OK");
  } catch (err) {
    res.status(502).send(err);
  }
});

app.get("/", async (req: Request, res: Response) => {
  res.status(200).send("Hello world!");
});

const port = Number(process.env.SERVER_PORT ?? 3000);

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
