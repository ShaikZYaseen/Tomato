import prismaClient from "db/client";
import express, { type Request, type Response } from "express";
import redis from "../../ws-server";
import { userMiddleware } from "../helpers/middleware";

const roomRouter = express.Router();



  roomRouter.get('/rooms', async (req:Request, res:Response) : Promise<any> => {
    const rooms = await prismaClient.room.findMany({
      select: { id: true, name: true, isPrivate: true, createdAt: true, ownerId: true }
    });
    const out = await Promise.all(
      rooms.map(async r => ({
        ...r,
        playerCount: await redis.sCard(`room:${r.id}:players`)
      }))
    );
    return res.json(out);
  });



  roomRouter.post(
    '/rooms',
    userMiddleware,
    async (req: Request, res: Response) : Promise<any> =>  {
      const { name, isPrivate } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Room name is required' });
      }
      const room = await prismaClient.room.create({
        //@ts-ignore
        data: { name, isPrivate: Boolean(isPrivate), ownerId: req.user!.id }
      });
      return res.status(201).json(room);
    }
  );