import { connectDB } from "./src/db/database.js";
import { startServer } from "./src/server/server.js";

await startServer();
await connectDB();
