// ✅ CommonJS workaround (Bun supports this)
import { WebSocketServer } from 'ws';
import type { WebSocket as WS } from 'ws';
import { createClient } from 'redis';


const PORT = 2567;
const wss = new WebSocketServer({ port: PORT });
 const redis = createClient();

(async () => {
  await redis.connect();
  console.log("🔗 Connected to Redis");

  const sockets = new Map<string, WS>();

  interface Player {
    id: string;
    x: number;
    y: number;
    roomId: string;
  }

  async function broadcastToRoom(roomId: string, data: any, excludeSocket?: WS) {
    const memberIds = await redis.sMembers(`room:${roomId}:players`);
    for (const memberId of memberIds) {
      const socket = sockets.get(memberId);
      if (socket && socket.readyState === 1 && socket !== excludeSocket) {
        socket.send(JSON.stringify(data));
      }
    }
  }

  wss.on('connection', async (ws: WS) => {
    let playerId: string | null = null;

    ws.on('message', async (raw: string) => {
      try {
        const data = JSON.parse(raw);
        if (!data.type) return;

        // Handle joining a room (and initial connection)
        if (data.type === 'join_room') {
          // ✅ Use playerId from frontend
          playerId = data.playerId;
          if (!playerId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Missing playerId' }));
            ws.close();
            return;
          }

          const roomId = data.roomId as string;

          sockets.set(playerId, ws);

          const player: Player = {
            id: playerId,
            x: 0,
            y: 0,
            roomId
          };

          await redis.hSet(`player:${playerId}`, player as any);
          await redis.sAdd(`room:${roomId}:players`, playerId);

          ws.send(JSON.stringify({ type: 'room_joined', roomId, id: playerId }));
        }

        // Handle movement
        if (data.type === 'move') {
          if (!playerId) return;
          const { x, y } = data;
          const rawPlayer = await redis.hGetAll(`player:${playerId}`);
          if (!rawPlayer || !rawPlayer.roomId) return;

          const updatedPlayer: Player = {
            id: playerId,
            x: Number(x),
            y: Number(y),
            roomId: rawPlayer.roomId
          };

          await redis.hSet(`player:${playerId}`, updatedPlayer as any);

          await broadcastToRoom(updatedPlayer.roomId, {
            type: 'player_moved',
            id: playerId,
            x,
            y
          }, ws);

          const others = await redis.sMembers(`room:${updatedPlayer.roomId}:players`);
          for (const otherId of others) {
            if (otherId === playerId) continue;
            const otherPlayerRaw = await redis.hGetAll(`player:${otherId}`);
            if (otherPlayerRaw) {
              const dx = Number(x) - Number(otherPlayerRaw.x);
              const dy = Number(y) - Number(otherPlayerRaw.y);
              if (Math.hypot(dx, dy) < 100) {
                ws.send(JSON.stringify({ type: 'nearby', peerId: otherId }));
              }
            }
          }
        }
      } catch (err) {
        console.error("Invalid message received:", err);
      }
    });

    ws.on('close', async () => {
      if (!playerId) return;

      const playerRaw = await redis.hGetAll(`player:${playerId}`);
      if (playerRaw?.roomId) {
        await redis.sRem(`room:${playerRaw.roomId}:players`, playerId);
        await broadcastToRoom(playerRaw.roomId, {
          type: 'player_left',
          id: playerId
        });
      }
      await redis.del(`player:${playerId}`);
      sockets.delete(playerId);
    });
  });

  console.log(`✅ WebSocket server running on ws://localhost:${PORT}`);
})();

export default redis;