import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";
import cookieParser from "cookie-parser";

export const app = express();
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "NM Forms API",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

const allowedOrigins = env.FRONTEND_URL?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.NODE_ENV !== "prod" || !allowedOrigins?.length) {
        callback(null, true);
        return;
      }

      callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());



app.get("/", (req, res) => {
  return res.json({ message: "NM Forms API is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "NM Forms API is healthy", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);


export default app;
