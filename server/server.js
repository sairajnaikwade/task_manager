import app from "./app.js";
import { env } from "./config/env.js";
import logger from "./config/logger.js";
import db from "./config/db.js";

const start = async () => {
  try {
    await db.$connect();
    logger.info("Database connected");

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error(err, "Failed to start server");
    process.exit(1);
  }
};

start();
