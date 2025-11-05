import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import type { Express } from "express";

export function applySecurity(app: Express) {
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
  }));
}
