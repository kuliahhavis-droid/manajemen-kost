import prisma from "@/lib/prisma"
import { Room, Prisma } from "@prisma/client"

export async function getAllRooms() {
  return await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function createRoom(data: Prisma.RoomCreateInput) {
  return await prisma.room.create({
    data,
  })
}

export async function deleteRoom(id: string) {
  return await prisma.room.delete({
    where: { id },
  })
}

export async function getRoomById(id: string) {
  return await prisma.room.findUnique({
    where: { id },
  })
}

export async function updateRoom(id: string, data: Prisma.RoomUpdateInput) {
  return await prisma.room.update({
    where: { id },
    data,
  })
}
