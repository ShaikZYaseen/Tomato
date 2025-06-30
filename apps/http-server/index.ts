import express, { type Request, type Response } from "express"
import authRouter from "./routes/auth";

const app = express();





app.use("/api/v1/auth",authRouter)


app.listen(8080, () => {
   console.log("Http server is listening to port 8080")
})