import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./src/config/env";
import { checkDatabaseConnection } from "./src/database/pool";
import routes from "./src/routes";
import { errorHandler } from "./src/errors/errorHandler";

async function main() {
  await checkDatabaseConnection();

  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api", routes);
  app.use(errorHandler);

  app.listen(env.PORT, () => {
    console.log(`🚀 Pevilog API running on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
