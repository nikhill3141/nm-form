import http from "node:http";
import { logger } from "@repo/logger";
import { app as expressApplication } from "./server";

import { env } from "./env";

export default expressApplication;

async function init() {
  try {
    const server = http.createServer(expressApplication);
    const PORT: number = env.PORT ? +env.PORT : 8000;
    server.listen(PORT, () => {
      logger.info(`http server is running on PORT ${PORT}`);
    });
  } catch (err) {
    logger.error(`Error creating http server`, { err });
    process.exit(1);
  }
}

if (process.env.VERCEL !== "1") {
  init();
}
