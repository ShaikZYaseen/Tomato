'use client'; // This is the most important line to add

import React, { useState, useEffect, useCallback } from 'react';
import { Users, MessageCircle, Settings, Volume2, VolumeX } from 'lucide-react';

export default function GatherTownPage() {
  const [playerPosition, setPlayerPosition] = useState({ x: 400, y: 300 });
  const [otherPlayers, setOtherPlayers] = useState([
    { id: 1, name: 'Alice', x: 200, y: 200, color: '#71717a' },
    { id: 2, name: 'Bob', x: 600, y: 400, color: '#52525b' },
    { id: 3, name: 'Charlie', x: 300, y: 500, color: '#3f3f46' }
  ]);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alice', text: 'Hey everyone! 👋', time: '10:30' },
    { id: 2, user: 'Bob', text: 'Great to see you all here!', time: '10:31' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [nearbyPlayers, setNearbyPlayers] = useState<{ id: number; name: string; }[]>([]);

  // Game board dimensions
  const BOARD_WIDTH = 800;
  const BOARD_HEIGHT = 600;
  const PLAYER_SIZE = 40;
  const INTERACTION_RADIUS = 80;

  // Obstacles/furniture
  const obstacles = [
    { x: 100, y: 100, width: 120, height: 80, type: 'table', color: '#52525b' },
    { x: 500, y: 150, width: 100, height: 60, type: 'desk', color: '#3f3f46' },
    { x: 200, y: 400, width: 80, height: 80, type: 'chair', color: '#27272a' },
    { x: 600, y: 300, width: 60, height: 100, type: 'bookshelf', color: '#18181b' }
  ];

  const checkCollision = useCallback((x: number, y: number) => {
    for (const obstacle of obstacles) {
      if (
        x < obstacle.x + obstacle.width &&
        x + PLAYER_SIZE > obstacle.x &&
        y < obstacle.y + obstacle.height &&
        y + PLAYER_SIZE > obstacle.y
      ) {
        return true;
      }
    }
    return false;
  }, []);

  const isWithinBounds = (x: number, y: number) => {
    return x >= 0 && x <= BOARD_WIDTH - PLAYER_SIZE && y >= 0 && y <= BOARD_HEIGHT - PLAYER_SIZE;
  };

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Update nearby players for interaction
  useEffect(() => {
    const nearby = otherPlayers.filter(player =>
      getDistance(playerPosition.x, playerPosition.y, player.x, player.y) <= INTERACTION_RADIUS
    );
    setNearbyPlayers(nearby);
  }, [playerPosition, otherPlayers]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Move player based on keyboard input
  useEffect(() => {
    const movePlayer = () => {
      setPlayerPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        const speed = 3;

        if (keys['ArrowUp'] || keys['w']) newY -= speed;
        if (keys['ArrowDown'] || keys['s']) newY += speed;
        if (keys['ArrowLeft'] || keys['a']) newX -= speed;
        if (keys['ArrowRight'] || keys['d']) newX += speed;

        if (isWithinBounds(newX, newY) && !checkCollision(newX, newY)) {
          return { x: newX, y: newY };
        }
        return prev;
      });
    };

    const interval = setInterval(movePlayer, 16); // ~60fps
    return () => clearInterval(interval);
  }, [keys, checkCollision]);

  // Simulate other players moving
  useEffect(() => {
    const moveOtherPlayers = () => {
      setOtherPlayers(prev => prev.map(player => {
        const dx = (Math.random() - 0.5) * 2;
        const dy = (Math.random() - 0.5) * 2;
        const newX = Math.max(0, Math.min(BOARD_WIDTH - PLAYER_SIZE, player.x + dx));
        const newY = Math.max(0, Math.min(BOARD_HEIGHT - PLAYER_SIZE, player.y + dy));

        if (!checkCollision(newX, newY)) {
          return { ...player, x: newX, y: newY };
        }
        return player;
      }));
    };

    const interval = setInterval(moveOtherPlayers, 1000); // Slower movement for simulation
    return () => clearInterval(interval);
  }, [checkCollision]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: 'You',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4 font-sans">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="bg-zinc-800/80 backdrop-blur-lg rounded-lg p-4 mb-4 flex items-center justify-between border border-zinc-700/50">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-zinc-600 to-zinc-500 rounded-full flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-zinc-100">Virtual Workspace</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-zinc-300 text-sm">
              Online: {otherPlayers.length + 1}
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-full transition-colors border border-zinc-600/30"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-zinc-300" /> : <Volume2 className="w-5 h-5 text-zinc-300" />}
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-full transition-colors border border-zinc-600/30"
            >
              <MessageCircle className="w-5 h-5 text-zinc-300" />
            </button>
            <button className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-full transition-colors border border-zinc-600/30">
              <Settings className="w-5 h-5 text-zinc-300" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Game Board Column */}
          <div className="flex-1">
            <div className="bg-zinc-800/60 backdrop-blur-lg rounded-lg p-4 border border-zinc-700/50">
              <div
                className="relative bg-zinc-700 rounded-lg overflow-hidden border border-zinc-600/30"
                style={{ width: '100%', paddingBottom: `${(BOARD_HEIGHT / BOARD_WIDTH) * 100}%` }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    width: BOARD_WIDTH,
                    height: BOARD_HEIGHT,
                    transform: 'scale(var(--scale-factor, 1))',
                    transformOrigin: 'top left'
                  }}
                >
                  {/* Grid pattern */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
                      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                  }} />

                  {/* Obstacles */}
                  {obstacles.map((obstacle, index) => (
                    <div
                      key={index}
                      className="absolute rounded-lg shadow-lg border border-zinc-500/20"
                      style={{
                        left: obstacle.x, top: obstacle.y,
                        width: obstacle.width, height: obstacle.height,
                        backgroundColor: obstacle.color
                      }}
                    >
                      <div className="absolute inset-0 bg-black/20 rounded-lg" />
                    </div>
                  ))}

                  {/* Other Players */}
                  {otherPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="absolute transition-all duration-300 ease-linear"
                      style={{
                        transform: `translate(${player.x}px, ${player.y}px)`
                      }}>
                      <div
                        className="relative rounded-full border-2 border-white/80 shadow-lg"
                        style={{ width: PLAYER_SIZE, height: PLAYER_SIZE, backgroundColor: player.color }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                          {player.name}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Current Player */}
                  <div
                    className="absolute transition-all duration-100 ease-linear"
                    style={{
                      transform: `translate(${playerPosition.x}px, ${playerPosition.y}px)`
                    }}>
                    <div
                      className="relative rounded-full border-4 border-white shadow-xl ring-2 ring-blue-400"
                      style={{ width: PLAYER_SIZE, height: PLAYER_SIZE, backgroundColor: '#3b82f6' }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        You
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 bg-zinc-800/60 backdrop-blur-lg rounded-lg p-4 border border-zinc-700/50">
              <div className="text-zinc-100 text-sm mb-2">Controls:</div>
              <div className="text-zinc-300 text-xs">
                Use <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">WASD</kbd> or <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Arrow Keys</kbd> to move.
              </div>
              {nearbyPlayers.length > 0 && (
                <div className="mt-2 text-yellow-400 text-sm">
                  You are near: {nearbyPlayers.map(p => p.name).join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="w-full lg:w-80 flex-shrink-0 bg-zinc-800/60 backdrop-blur-lg rounded-lg p-4 border border-zinc-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-100 font-medium">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  &times;
                </button>
              </div>

              <div className="h-80 overflow-y-auto mb-4 space-y-2 pr-2">
                {messages.map((message) => (
                  <div key={message.id} className="bg-zinc-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-zinc-100">{message.user}</span>
                      <span className="text-xs text-zinc-400">{message.time}</span>
                    </div>
                    <p className="text-sm text-zinc-200 break-words">{message.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-3 py-2 bg-zinc-700/50 text-zinc-100 placeholder-zinc-400 rounded-lg border border-zinc-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}