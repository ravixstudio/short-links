import "dotenv/config";

import { runMigrations } from "./connection.js";

await runMigrations();
console.log("Migrations applied successfully");
