import express, {type Request,type Response } from "express";
import { hashedPassword, signJwt, verifyPassword } from "../helpers/auth";
import prismaClient from "db/client";

const authRouter = express.Router()

authRouter.post("/signin", async(req:Request,res:Response) => {
    try {
      const {email,password} = req.body;
      if(!email || !password){
        res.status(400).send({message:"username and password are required"})
        return;
      }

      const user = await prismaClient.user.findFirst({
        where:{
            email:email
        }
      });

      if (!user) {
        res.status(403).json({message: "User not found"})
        return
    }

      const isPasswordCorrect = await verifyPassword(password,user.password);
       if(!isPasswordCorrect){
        res.status(403).json({success:false,message: "Invalid password"})
        return
       }

       const token = await signJwt({userId:user.id})

       res.status(200).json({
        success:true,
        message:"Log in successful",
        token
       })

       return;  

    } catch (error) {
       console.error("Error while logging in",error);
       throw error; 
    }
})

authRouter.post("/signup", async(req:Request,res:Response)=>{
    try {
      const {username,password,email} = req.body;
      if(!username || !password  || !email){
        res.status(400).json({message:"All details are mandatory"})
        return;
      } 
      const userExists = await prismaClient.user.findFirst({
        where:{
          email:email
        }
      })
      if(userExists){
        res.status(400).json({message:"User with the email already exists!"});
        return;
      }
      const hashedString = await hashedPassword(password);
      const user = await prismaClient.user.create({
      data:{
        name:username,
        password:hashedString,
        email
      } 
      })
      console.log("USER",user)
      const token = await signJwt({userId:user.id})
      res.status(200).json({
        message:"User registered successfully",
        token
      })
      return;
    } catch (error) {
        console.error("Error while registering user",error);
        throw error;
    }
})

authRouter.get("/profile",async(req:Request,res:Response) => {
    try {
       const userId = req.params.userId;
       const user = await prismaClient.user.findUnique({
        where: { id: userId }
      });
      
       if(!user){
        res.status(404).json({message:"No user found"})
        return;
       }
       res.status(200).json({
            user
       })
       return;
    } catch (error) {
        console.error("Error in getting profile",error);
        throw error;
    }
})


export default authRouter;