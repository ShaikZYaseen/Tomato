import express, { type Request, type Response } from "express"

const app = express();



app.listen(8080, () => {
   console.log("Http server is listening to port 8080")
})