import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN, 
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//  routes import 

import userRouter from './routes/user.routes.js'

// routes declaration
app.use("api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("api/v1/subscriptions", subscriptionRouter)
app.use("api/v1/videos", videoRouter)
app.use("api/v1/comments", commentRouter)
app.use("api/v1/likes", likeRouter)

// https://localhost:8000/api/v1/users/register
export {app}