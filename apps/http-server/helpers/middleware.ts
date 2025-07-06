import {type NextFunction,type Request, type Response } from "express"
import jwt from "jsonwebtoken";
import { verifyJwt } from "./auth";

const JWT_SECRET=process.env.JWT_SECRET


export const userMiddleware = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const header = req.headers["authorization"];
        const token = header?.split(" ")[1];
         if (!token) {
            res.status(403).json({message: "Unauthorized"})
            return
        }
        const decoded = await verifyJwt(token);
        //@ts-ignore
        req.userId = decoded.userId
        next()
    
    } catch (error) {
        res.status(401).json({message: "Unauthorized"})
        return
    }
}

export const adminMiddleware = async(req:Request,res:Response,next:NextFunction) => {
    try {
        const header = req.headers["authorization"];
        const token = header?.split(" ")[1];
         if (!token) {
            res.status(403).json({message: "Unauthorized"})
            return
        } 
        const decoded = await verifyJwt(token);
        
        //@ts-ignore
        req.userId = decoded.userId
        next()

    } catch (error) {
        res.status(401).json({message: "Unauthorized"})
        return
     }
}