import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import morgan from "morgan";

export const app = express();
app.use(morgan("dev"));

const db = new PrismaClient({ log: ["error", "info", "query", "warn"] });

app.get("/db-test", async (req: Request, res: Response) => {
  try {
    await db.$queryRaw`SELECT 1 + 1`;
    res.status(200).send("OK");
  } catch (err) {
    res.status(502).send(err);
  }
});

app.get("/", async (req: Request, res: Response) => {
  res.status(200).send("Hello world!");
});

const port = Number(process.env.PORT ?? 3000);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
