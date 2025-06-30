'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Users, LogIn, Hash } from 'lucide-react';

export default function RoomDashboard() {
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      alert('Please enter a valid Room ID');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - replace with your actual logic
    setTimeout(() => {
      console.log('Joining room:', roomId);
      alert(`Joining room: ${roomId}`);
      setIsLoading(false);
      // You can add router.push('/room/' + roomId) here
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border border-zinc-800 bg-zinc-900/95 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-zinc-200" />
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-100">
              Join Room
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your room ID to connect with others
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="roomId" className="text-sm font-medium text-zinc-300">
                Room ID
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="roomId"
                  type="text"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-lg bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500"
                />
              </div>
            </div>

            <Button 
              onClick={handleJoinRoom}
              disabled={!roomId.trim() || isLoading}
              className="w-full h-12 text-lg font-semibold bg-zinc-200 hover:bg-zinc-100 text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                  Joining...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Join Room
                </div>
              )}
            </Button>

            <div className="pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 text-center">
                Make sure you have the correct room ID from your host
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-zinc-800 bg-zinc-900/50">
            <div className="text-center">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-4 w-4 text-zinc-300" />
              </div>
              <p className="text-sm font-medium text-zinc-200">Create Room</p>
              <p className="text-xs text-zinc-500">Start new session</p>
            </div>
          </Card>
          
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-zinc-800 bg-zinc-900/50">
            <div className="text-center">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <Hash className="h-4 w-4 text-zinc-300" />
              </div>
              <p className="text-sm font-medium text-zinc-200">Recent Rooms</p>
              <p className="text-xs text-zinc-500">View history</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}