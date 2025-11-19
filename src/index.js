import "dotenv/config";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./lib/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRouter from "./routes/auth.js";
import metricsRouter from "./routes/metrics.js";
import trendsRouter from "./routes/trends.js";
import { generalLimiter, authLimiter } from "./middleware/rateLimit.js";

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(generalLimiter);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/metrics", metricsRouter);
app.use("/api/trends", trendsRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 API on http://localhost:${env.PORT}`);
});
