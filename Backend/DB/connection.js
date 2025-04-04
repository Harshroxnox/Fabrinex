import mysql from 'mysql2/promise'; // Use the promise-based version

const connectDB = async () => {
    try {
        const db = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: process.env.MYSQL_PASSWORD,
            database: "ecommerce",
        });

        console.log(`\n✅ MySQL connected successfully!`);
        return db; // Return the connection object
    } catch (error) {
        console.log("❌ MySQL connection FAILED:", error);
        process.exit(1);
    }
};

export default connectDB;

  