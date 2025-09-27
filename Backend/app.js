import express from "express"
import cors from "cors"
import errorHandler from "./middleware/error.middleware.js";
import requestLogger from "./middleware/logMiddleware.js"
import cookieParser from "cookie-parser"
import dotenv from "dotenv";

dotenv.config();

const app = express();

// for request logging using winston
app.use(requestLogger);

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use((req, res, next) => {
    req.setTimeout(60000); 
    next();
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


// routes imports
import userRouter from './routes/users.routes.js'
import adminRouter from './routes/adminUsers.routes.js'
import productRouter from './routes/products.routes.js'
import authRouter from "./routes/auth.routes.js"
import paymentRouter from "./routes/payments.routes.js"
import marketingRouter from "./routes/marketing.routes.js"
import promotionRouter from "./routes/promotions.routes.js"
import orderRouter from "./routes/orders.routes.js"
import bannerRouter from "./routes/banners.routes.js"
import salesPersonRouter from "./routes/salesperson.routes.js"
import loyaltyCardRouter from "./routes/loyaltycards.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import billRouter from "./routes/bill.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admins", adminRouter)
app.use("/api/v1/products",productRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/payments", paymentRouter)
app.use("/api/v1/marketing", marketingRouter)
app.use("/api/v1/promotions", promotionRouter)
app.use("/api/v1/orders",orderRouter)
app.use("/api/v1/banners",bannerRouter)
app.use("/api/v1/salespersons",salesPersonRouter)
app.use("/api/v1/loyaltycards",loyaltyCardRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/bills",billRouter);

// for error handling
app.use(errorHandler);

export { app }