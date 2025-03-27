import 'dotenv/config';
import connectDB from "./DB/connection.js";
import { app } from './app.js';

let db;
const startServer = async () => {
    db = await connectDB(); // Store the connection

    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port: ${process.env.PORT || 8000}`);
    });
};

startServer();

export { db }; // Export the database connection
