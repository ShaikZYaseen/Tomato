import express, { type Request, type Response } from "express"
import cors from "cors";
import authRouter from "./routes/auth";
import roomRouter from "./routes/rooms";

const app = express();



app.use(cors())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/auth",authRouter)
app.use("/api/v1/rooms",roomRouter)


app.listen(8080, () => {
   console.log("Http server is listening to port 8080")
})