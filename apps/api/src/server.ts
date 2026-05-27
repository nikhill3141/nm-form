import express from "express";
import { logger } from "@repo/logger";
import cors, { type CorsOptions } from "cors";

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

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");
const allowedOrigins = new Set([
  "https://nm-form-web.vercel.app",
  ...(env.FRONTEND_URL?.split(",").map(normalizeOrigin) ?? []),
]);
const allowedMethods = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const allowedHeaders = [
  "Accept",
  "Authorization",
  "Content-Type",
  "Origin",
  "TRPC-Accept",
  "X-Requested-With",
];

const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true;
  return allowedOrigins.has(normalizeOrigin(origin));
};

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: allowedMethods,
  allowedHeaders,
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (typeof origin === "string" && isAllowedOrigin(origin)) {
    res.header("Access-Control-Allow-Origin", normalizeOrigin(origin));
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", allowedMethods.join(","));
    res.header(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"]?.toString() ?? allowedHeaders.join(","),
    );
    res.vary("Origin");
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(isAllowedOrigin(typeof origin === "string" ? origin : undefined) ? 204 : 403);
    return;
  }

  next();
});
app.use(cors(corsOptions));
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
