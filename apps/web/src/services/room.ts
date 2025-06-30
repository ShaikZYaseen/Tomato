import axios from "axios";

export interface RoomDetails {
  id: string;
  name: string;
  isPrivate: boolean;
  createdAt: string;
  ownerId: string;
  playerCount: number;
}

export const joinRoomService = async (id: string): Promise<RoomDetails> => {
  try {
    const url = `http://localhost:3000/api/v1/rooms/${id}/join`;
    const response = await axios.post<RoomDetails>(url);
    return response.data;
  } catch (error: any) {
    console.error("Failed to join room:", error);
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      "Unable to join room"
    );
  }
};
