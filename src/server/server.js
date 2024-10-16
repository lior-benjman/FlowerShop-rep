import { config } from "../config/config.js";
import { app } from "./app.js";

export const startServer = async () => {
    const {serverPort} = config;
    app.listen(serverPort)
    console.log(`Server running on port ${serverPort}`);
};
