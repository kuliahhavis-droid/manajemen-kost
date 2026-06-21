import prisma from "@/lib/prisma"

export async function getAllTenants(statusFilter?: "AKTIF" | "TIDAK_AKTIF") {
  return await prisma.tenant.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: { room: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAvailableRooms() {
  return await prisma.room.findMany({
    where: { status: "KOSONG" },
    orderBy: { number: "asc" },
  })
}
