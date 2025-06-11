import mysql from 'mysql2/promise'; // Use the promise-based version
import Redis from 'ioredis';


// Connect to MySQL
export const connectDB = async () => {
    try {
        const db = await mysql.createConnection({
            host: "localhost",
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: "ecommerce",
        });

        console.log(`✅ MySQL connected successfully!`);
        return db; // Return the connection object
    } catch (error) {
        console.log("❌ MySQL connection FAILED:", error);
        process.exit(1);
    }
};

// Connect to Redis
export const connectRedis = async () => {
    try {
        const redis = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379,
            // password: process.env.REDIS_PASSWORD, // if needed
        });

        console.log(`✅ Redis connected successfully!`);
        return redis; // Return the connection object
    } catch (error) {
        console.log("❌ Redis connection FAILED:", error);
        process.exit(1);
    }
};
  