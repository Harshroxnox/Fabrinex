import 'dotenv/config';
import { connectDB, connectRedis } from "./DB/connection.js";
import { app } from './app.js';

let db;
let redis;
const startServer = async () => {
    // Store the connection
    db = await connectDB(); 
    redis = await connectRedis();

    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port: ${process.env.PORT || 8000}`);
    });
};

startServer();

export { db, redis }; // Export the database connection
