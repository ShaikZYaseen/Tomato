import prismaClient from "db/client";
import express, { type Request, type Response } from "express";
import redis from "../../ws-server";
import { userMiddleware } from "../helpers/middleware";

const roomRouter = express.Router();



  roomRouter.get('/', async (req:Request, res:Response) : Promise<any> => {
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
    '/',
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


  roomRouter.get(
    '/:roomId',
    async (req: Request, res: Response) : Promise<any> => {
      const { roomId } = req.params;
      const room = await prismaClient.room.findUnique({
        where: { id: roomId },
        select: { id: true, name: true, isPrivate: true, createdAt: true, ownerId: true }
      });
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      const playerCount = await redis.sCard(`room:${roomId}:players`);
      return res.json({ ...room, playerCount });
    }
  );



  
roomRouter.delete(
    '/:roomId',
    userMiddleware,
    async (req: Request, res: Response) : Promise<any> => {
      const { roomId } = req.params;
      const room = await prismaClient.room.findUnique({ where: { id: roomId } });
      if (!room) return res.status(404).json({ error: 'Room not found' });
      //@ts-ignore
      if (room.ownerId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      await prismaClient.room.delete({ where: { id: roomId } });
      await redis.del(`room:${roomId}:players`);
      return res.status(204).send();
    }
  );



  

