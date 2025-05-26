import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use((req, res, next) => {
    req.setTimeout(60000); 
    next();
});

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())



//routes imports
import userRouter from './routes/user.routes.js'
import productRouter from './routes/product.routes.js'
import authRouter from "./routes/auth.routes.js";


//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/products",productRouter)
app.use("/api/v1/auth", authRouter);


export { app }


